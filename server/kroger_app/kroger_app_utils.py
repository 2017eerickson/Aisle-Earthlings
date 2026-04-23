"""
kroger_app/utils.py
====================

Utility functions for fetching and caching Kroger data.

Functions:
    get_locations_by_zip(zip_code)
        → fetches up to 6 nearest Kroger stores for a zip code,
          upserts each into CachedStore, returns list of CachedStore objects.

    get_vegan_products_for_location(location_id)
        → fetches up to 30 vegan-tagged products from Kroger for a given store,
          upserts each into CachedProduct + ProductPrice, returns list of dicts
          ready to serialize and return to the frontend.

    get_vegan_products_for_locations(location_ids)
        → convenience wrapper — calls get_vegan_products_for_location() for
          each location_id in the list and returns a dict keyed by location_id.
          Used by the store comparison page (up to 4 stores in parallel).

    get_product_by_upc_and_location(upc, location_id)
        → checks CachedProduct + ProductPrice first; on cache miss calls
          GET /v1/products/{upc}?filter.locationId={location_id}, upserts
          the result, and returns a single product+price dict.

Internal helpers:
    _get_kroger_token()   — client credentials OAuth, cached in module memory
    _kroger_get(path, params)  — authenticated GET against api.kroger.com

Notes:
    - Kroger's filter.term="vegan" is a keyword search, not a dietary tag filter.
      It returns products with "vegan" in the name or marketing copy.
      Results are stored as-is; Gemini vegan verification (is_vegan field) is
      separate and triggered only when the user clicks "Check if vegan".
    - Token is stored at module level and refreshed automatically when
      within 60 seconds of expiry. Safe for single-process dev servers.
      For multi-worker production use Django's cache backend instead.
    - All Kroger API errors are caught and re-raised as KrogerAPIError so
      views only need to handle one exception type.
"""

import time
import logging
from decimal import Decimal, InvalidOperation

import requests
from django.conf import settings

from kroger_app.models import CachedStore, CachedProduct, ProductPrice

logger = logging.getLogger(__name__)

KROGER_BASE_URL = 'https://api.kroger.com/v1'
KROGER_TOKEN_URL = 'https://api.kroger.com/v1/connect/oauth2/token'


# ─────────────────────────────────────────────────────────────
# Exceptions
# ─────────────────────────────────────────────────────────────

class KrogerAPIError(Exception):
    """Raised when the Kroger API returns an unexpected response."""
    def __init__(self, message, status_code=None):
        super().__init__(message)
        self.status_code = status_code


# ─────────────────────────────────────────────────────────────
# Token management — module-level cache
# ─────────────────────────────────────────────────────────────

_token_cache = {
    'access_token': None,
    'expires_at': 0.0,   # Unix timestamp
}


def _get_kroger_token():
    """
    Returns a valid Kroger client credentials access token.
    Fetches a new one if the cached token is missing or expires within 60s.

    Reads from settings:
        KROGER_CLIENT_ID
        KROGER_CLIENT_SECRET
    """
    now = time.time()
    if _token_cache['access_token'] and now < _token_cache['expires_at'] - 60:
        return _token_cache['access_token']

    client_id = settings.KROGER_CLIENT_ID
    client_secret = settings.KROGER_CLIENT_SECRET

    try:
        response = requests.post(
            KROGER_TOKEN_URL,
            data={
                'grant_type': 'client_credentials',
                'scope': 'product.compact',
            },
            auth=(client_id, client_secret),
            timeout=10,
        )
        response.raise_for_status()
    except requests.RequestException as e:
        raise KrogerAPIError(f'Failed to obtain Kroger token: {e}')

    data = response.json()
    _token_cache['access_token'] = data['access_token']
    _token_cache['expires_at'] = now + data.get('expires_in', 1800)

    logger.debug('Kroger token refreshed, expires in %ss', data.get('expires_in'))
    return _token_cache['access_token']


# ─────────────────────────────────────────────────────────────
# Authenticated Kroger GET
# ─────────────────────────────────────────────────────────────

def _kroger_get(path, params=None):
    """
    Make an authenticated GET request to the Kroger API.

    Args:
        path   (str):  API path, e.g. '/locations' or '/products'
        params (dict): Query parameters

    Returns:
        dict: Parsed JSON response body

    Raises:
        KrogerAPIError: On any non-2xx response or network error
    """
    token = _get_kroger_token()
    url = f'{KROGER_BASE_URL}{path}'

    try:
        response = requests.get(
            url,
            headers={
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json',
            },
            params=params or {},
            timeout=15,
        )
        response.raise_for_status()
    except requests.HTTPError as e:
        raise KrogerAPIError(
            f'Kroger API error on {path}: {e}',
            status_code=response.status_code,
        )
    except requests.RequestException as e:
        raise KrogerAPIError(f'Network error calling Kroger API: {e}')

    return response.json()


# ─────────────────────────────────────────────────────────────
# Location helpers
# ─────────────────────────────────────────────────────────────

def _parse_store(raw):
    """
    Parse a single store dict from the Kroger Locations API response
    into a flat dict matching CachedStore fields.
    """
    address = raw.get('address', {})
    geolocation = raw.get('geolocation', {})
    chain = raw.get('chain', '')

    return {
        'location_id': raw.get('locationId', ''),
        'name': chain or raw.get('name', ''),
        'store_number': raw.get('storeNumber', ''),
        'address_line': address.get('addressLine1', ''),
        'city': address.get('city', ''),
        'state': address.get('state', ''),
        'zip_code': address.get('zipCode', ''),
        'distance_miles': raw.get('distance'),
    }


def get_locations_by_zip(zip_code):
    """
    Fetch the 6 nearest Kroger stores for a given zip code.

    Calls: GET /v1/locations?filter.zipCode.near=X&filter.limit=6

    Each store is upserted into CachedStore so subsequent calls that need
    store display info (name, address) can read from the DB without
    re-calling Kroger.

    Args:
        zip_code (str): 5-digit US zip code, e.g. "21701"

    Returns:
        list[CachedStore]: Up to 6 CachedStore objects ordered by distance.

    Raises:
        KrogerAPIError: If the Kroger API call fails.
        ValueError: If zip_code is not a 5-digit string.
    """
    if not zip_code or not zip_code.isdigit() or len(zip_code) != 5:
        raise ValueError(f'zip_code must be a 5-digit string, got: {repr(zip_code)}')

    cached = list(CachedStore.objects.filter(searched_zip=zip_code))
    if cached:
        logger.debug('Cache hit for zip %s — returning %d stores', zip_code, len(cached))
        return cached

    logger.info('Cache miss for zip %s — fetching from Kroger API', zip_code)

    data = _kroger_get('/locations', params={
        'filter.zipCode.near': zip_code,
        'filter.limit': 6,
    })

    raw_stores = data.get('data', [])
    stores = []

    for raw in raw_stores:
        parsed = _parse_store(raw)
        if not parsed['location_id']:
            continue

        store, created = CachedStore.objects.update_or_create(
            location_id=parsed['location_id'],
            defaults={
                **{k: v for k, v in parsed.items() if k != 'location_id' and v is not None},
                'searched_zip': zip_code,
            },
        )
        stores.append(store)
        logger.debug(
            '%s CachedStore %s (%s)',
            'Created' if created else 'Updated',
            store.location_id,
            store.display_name,
        )

    logger.info('Returning %d stores for zip %s', len(stores), zip_code)
    return stores


# ─────────────────────────────────────────────────────────────
# Product helpers
# ─────────────────────────────────────────────────────────────

def _parse_product(raw):
    """
    Parse a single product dict from the Kroger Products API response
    into separate product-level and price-level field dicts.

    Returns:
        tuple(product_fields dict, price_fields dict)
    """
    # ── Product-level fields (go into CachedProduct) ──
    images = raw.get('images', [])
    image_map = {}
    for img in images:
        perspective = img.get('perspective', '')
        sizes = {s['size']: s['url'] for s in img.get('sizes', [])}
        # Prefer large, fall back through sizes
        url = (
            sizes.get('large')
            or sizes.get('xlarge')
            or sizes.get('medium')
            or sizes.get('small')
            or sizes.get('thumbnail')
            or ''
        )
        if perspective and url:
            image_map[perspective] = url

    categories = raw.get('categories', [])
    categories_str = ','.join(categories) if categories else ''

    product_fields = {
        'name': raw.get('description', ''),
        'brand': raw.get('brand', ''),
        'categories': categories_str,
        'description': raw.get('description', ''),
        'image_front': image_map.get('front', ''),
        'image_back': image_map.get('back', ''),
        'image_left': image_map.get('left', ''),
        'image_right': image_map.get('right', ''),
    }

    # ── Price-level fields (go into ProductPrice) ──
    items = raw.get('items', [])
    item = items[0] if items else {}
    price_data = item.get('price', {})

    raw_price = price_data.get('regular') or price_data.get('promo') or None
    try:
        price = Decimal(str(raw_price)) if raw_price is not None else None
    except InvalidOperation:
        price = None

    price_fields = {
        'price': price,
        'price_per_unit': item.get('pricePerUnitEstimate', ''),
        'in_stock': item.get('inventory', {}).get('stockLevel', 'HIGH') != 'NONE',
        'sold_by': item.get('soldBy', ''),
        'size': item.get('size', ''),
    }

    return product_fields, price_fields


def get_vegan_products_for_location(location_id, limit=30):
    """
    Fetch up to `limit` vegan-tagged products from Kroger for a specific store.

    Calls: GET /v1/products?filter.term=vegan&filter.locationId=X&filter.limit=N

    Each product is upserted into CachedProduct (product-level data) and
    ProductPrice (store-specific price/availability). Products that are
    already in the DB are still updated with fresh prices.

    Note on vegan accuracy: Kroger's filter.term="vegan" is a keyword search
    against product names and descriptions — not a verified dietary tag.
    The is_vegan / vegan_checked fields on CachedProduct are populated
    separately when a user clicks "Check if vegan" (Gemini verification).

    Args:
        location_id (str): Kroger locationId, e.g. "01400376"
        limit       (int): Max products to fetch. Default 30, max 50 per Kroger API.

    Returns:
        list[dict]: Serialized product + price data, ready for API response.
                    Each dict contains product fields + price fields + vegan_status.

    Raises:
        KrogerAPIError: If the Kroger API call fails.
        CachedStore.DoesNotExist: If location_id is not in CachedStore.
                                   Call get_locations_by_zip() first.
    """
    store = CachedStore.objects.get(location_id=location_id)

    logger.info(
        'Fetching up to %d vegan products for location %s (%s)',
        limit, location_id, store.display_name,
    )

    data = _kroger_get('/products', params={
        'filter.term': 'vegan',
        'filter.locationId': location_id,
        'filter.limit': min(limit, 50),   # Kroger API hard cap is 50
    })

    raw_products = data.get('data', [])
    results = []

    for raw in raw_products:
        upc = raw.get('productId') or raw.get('upc')
        if not upc:
            continue

        product_fields, price_fields = _parse_product(raw)

        # Upsert product — preserve existing vegan_checked / is_vegan values
        product, created = CachedProduct.objects.update_or_create(
            upc=upc,
            defaults=product_fields,
        )

        # Upsert price for this specific store
        price_obj, _ = ProductPrice.objects.update_or_create(
            product=product,
            store=store,
            defaults=price_fields,
        )

        results.append({
            'upc': product.upc,
            'name': product.name,
            'brand': product.brand,
            'categories': product.categories,
            'image_front': product.image_front,
            'image_back': product.image_back,
            'vegan_status': product.vegan_status,
            'is_vegan': product.is_vegan,
            'vegan_checked': product.vegan_checked,
            'price': str(price_obj.price) if price_obj.price is not None else None,
            'price_per_unit': price_obj.price_per_unit,
            'size': price_obj.size,
            'sold_by': price_obj.sold_by,
            'in_stock': price_obj.in_stock,
            'location_id': location_id,
        })

        logger.debug(
            '%s product %s (%s) @ %s',
            'Created' if created else 'Updated',
            upc, product.name, store.display_name,
        )

    logger.info(
        'Returning %d vegan products for location %s',
        len(results), location_id,
    )
    return results


def get_products_by_search_term(location_id, search_term, limit=30):
    """
    Fetch up to `limit` products from Kroger matching `search_term` at a specific store.
    The search term is prefixed with "vegan" so results are always vegan-tagged.

    Calls: GET /v1/products?filter.term=vegan+{search_term}&filter.locationId=X&filter.limit=N

    Each product is upserted into CachedProduct + ProductPrice as a side effect,
    preserving any existing vegan_checked / is_vegan values.

    Args:
        location_id (str): Kroger locationId, e.g. "01400376"
        search_term (str): User-supplied search string, e.g. "almond milk"
        limit       (int): Max products to return. Default 30, Kroger hard cap is 50.

    Returns:
        list[dict]: Serialized product + price data, same shape as
                    get_vegan_products_for_location().

    Raises:
        KrogerAPIError: If the Kroger API call fails.
        CachedStore.DoesNotExist: If location_id is not in CachedStore.
                                   Call get_locations_by_zip() first.
    """
    store = CachedStore.objects.get(location_id=location_id)

    term = f'vegan {search_term.strip()}'

    logger.info(
        'Searching up to %d products for term %r at location %s (%s)',
        limit, term, location_id, store.display_name,
    )

    data = _kroger_get('/products', params={
        'filter.term': term,
        'filter.locationId': location_id,
        'filter.limit': min(limit, 50),
    })

    raw_products = data.get('data', [])
    results = []

    for raw in raw_products:
        upc = raw.get('productId') or raw.get('upc')
        if not upc:
            continue

        product_fields, price_fields = _parse_product(raw)

        product, created = CachedProduct.objects.update_or_create(
            upc=upc,
            defaults=product_fields,
        )

        price_obj, _ = ProductPrice.objects.update_or_create(
            product=product,
            store=store,
            defaults=price_fields,
        )

        results.append({
            'upc': product.upc,
            'name': product.name,
            'brand': product.brand,
            'categories': product.categories,
            'image_front': product.image_front,
            'image_back': product.image_back,
            'vegan_status': product.vegan_status,
            'is_vegan': product.is_vegan,
            'vegan_checked': product.vegan_checked,
            'price': str(price_obj.price) if price_obj.price is not None else None,
            'price_per_unit': price_obj.price_per_unit,
            'size': price_obj.size,
            'sold_by': price_obj.sold_by,
            'in_stock': price_obj.in_stock,
            'location_id': location_id,
        })

        logger.debug(
            '%s product %s (%s) @ %s',
            'Created' if created else 'Updated',
            upc, product.name, store.display_name,
        )

    logger.info(
        'Returning %d products for term %r at location %s',
        len(results), term, location_id,
    )
    return results


def get_vegan_products_for_locations(location_ids, limit_per_location=30):
    """
    Fetch vegan products for multiple stores — used by the compare page.

    Calls get_vegan_products_for_location() sequentially for each location_id.
    Returns a dict keyed by location_id so the frontend can map results
    directly to each compare panel.

    Args:
        location_ids        (list[str]): Up to 4 Kroger locationIds.
        limit_per_location  (int):       Max products per store. Default 30.

    Returns:
        dict: {
            "01400376": [ {product+price dicts}, ... ],
            "01234567": [ ... ],
            ...
        }

    Errors for individual locations are caught and logged — a failed store
    returns an empty list rather than crashing the whole comparison.
    """
    results = {}

    for location_id in location_ids:
        try:
            results[location_id] = get_vegan_products_for_location(
                location_id,
                limit=limit_per_location,
            )
        except CachedStore.DoesNotExist:
            logger.warning(
                'location_id %s not in CachedStore — skipping. '
                'Call get_locations_by_zip() first.',
                location_id,
            )
            results[location_id] = []
        except KrogerAPIError as e:
            logger.error(
                'Kroger API error for location %s: %s',
                location_id, e,
            )
            results[location_id] = []

    return results


# ─────────────────────────────────────────────────────────────
# Single product lookup — cache-first with API fallback
# ─────────────────────────────────────────────────────────────

def get_product_details(upc, location_id):
    """
    Return product + price data for a single product at a specific store.

    Checks CachedProduct + ProductPrice first. On a cache miss, fetches from:
        GET /v1/products/{upc}?filter.locationId={location_id}
    and upserts the result into CachedProduct + ProductPrice before returning.

    Args:
        upc         (str): Product UPC / Kroger productId, e.g. "0001111042058"
        location_id (str): Kroger locationId, e.g. "01400376"

    Returns:
        dict: All product fields (upc, name, brand, categories, description,
              images, vegan status) plus store-specific price fields.
              Shape matches items returned by get_vegan_products_for_location().

    Raises:
        CachedStore.DoesNotExist: If location_id is not in CachedStore.
                                   Call get_locations_by_zip() first.
        KrogerAPIError: If the Kroger API call fails or the product is not
                        found at the given location.
    """
    try:
        price_obj = ProductPrice.objects.select_related('product', 'store').get(
            product__upc=upc,
            store__location_id=location_id,
        )
        logger.debug('Cache hit for upc %s at location %s', upc, location_id)

    except ProductPrice.DoesNotExist:
        # Cache miss — store must exist before we can upsert a price row
        store = CachedStore.objects.get(location_id=location_id)

        logger.info(
            'Cache miss for upc %s at location %s — calling Kroger API',
            upc, location_id,
        )

        data = _kroger_get(f'/products/{upc}', params={'filter.locationId': location_id})

        raw = data.get('data')
        if not raw:
            raise KrogerAPIError(
                f'Product {upc!r} not found at location {location_id!r}',
            )

        product_fields, price_fields = _parse_product(raw)

        product, created = CachedProduct.objects.update_or_create(
            upc=upc,
            defaults=product_fields,
        )

        price_obj, _ = ProductPrice.objects.update_or_create(
            product=product,
            store=store,
            defaults=price_fields,
        )

        logger.debug(
            '%s product %s (%s) @ %s',
            'Created' if created else 'Updated',
            upc, product.name, store.display_name,
        )

    product = price_obj.product
    return {
        'upc': product.upc,
        'name': product.name,
        'brand': product.brand,
        'categories': product.categories,
        'description': product.description,
        'image_front': product.image_front,
        'image_back': product.image_back,
        'image_left': product.image_left,
        'image_right': product.image_right,
        'vegan_status': product.vegan_status,
        'is_vegan': product.is_vegan,
        'vegan_checked': product.vegan_checked,
        'price': str(price_obj.price) if price_obj.price is not None else None,
        'price_per_unit': price_obj.price_per_unit,
        'size': price_obj.size,
        'sold_by': price_obj.sold_by,
        'in_stock': price_obj.in_stock,
        'location_id': location_id,
    }
