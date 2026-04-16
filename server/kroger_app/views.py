from rest_framework.response import Response
from rest_framework import status as s
from rest_framework.views import APIView

from users_app.views import UserView
from .serializers import CachedStoreSerializer
from .models import CachedStore
from .kroger_app_utils import (
    get_locations_by_zip,
    get_vegan_products_for_location,
    get_products_by_search_term,
    get_product_details,
    KrogerAPIError,
)


class StoresByZip(APIView):
    """
    POST /api/v1/kroger/stores/by-zip/
    Body: { "zip_code": "21701" }
    Returns up to 6 nearest Kroger stores for the given zip code.
    Upserts results into CachedStore as a side effect.
    """
    def post(self, request):
        zip_code = request.data.get('zip_code', '').strip()
        if not zip_code:
            return Response(
                {'error': 'zip_code is required'},
                status=s.HTTP_400_BAD_REQUEST,
            )
        try:
            stores = get_locations_by_zip(zip_code)
        except ValueError as e:
            return Response({'error': str(e)}, status=s.HTTP_400_BAD_REQUEST)
        except KrogerAPIError as e:
            return Response(
                {'error': 'Kroger API error', 'detail': str(e)},
                status=s.HTTP_502_BAD_GATEWAY,
            )
        return Response(CachedStoreSerializer(stores, many=True).data, status=s.HTTP_200_OK)


class KrogerProductSearch(APIView):
    """
    POST /api/v1/kroger/search/products/
    Body: { "location_id": "01400376" }
    Returns up to 30 vegan-tagged products for the given store.
    Upserts results into CachedProduct / ProductPrice as a side effect.
    Call StoresByZip first so the store exists in CachedStore.
    """
    def post(self, request):
        location_id = request.data.get('location_id', '').strip()
        if not location_id:
            return Response(
                {'error': 'location_id is required'},
                status=s.HTTP_400_BAD_REQUEST,
            )
        try:
            products = get_vegan_products_for_location(location_id)
        except CachedStore.DoesNotExist:
            return Response(
                {'error': f'Store {location_id!r} not found. Fetch stores by zip code first.'},
                status=s.HTTP_404_NOT_FOUND,
            )
        except KrogerAPIError as e:
            return Response(
                {'error': 'Kroger API error', 'detail': str(e)},
                status=s.HTTP_502_BAD_GATEWAY,
            )
        return Response(products, status=s.HTTP_200_OK)


class ProductSearchByTerm(APIView):
    """
    POST /api/v1/kroger/search/products/by-term/
    Body: { "location_id": "01400376", "search_term": "almond milk" }
    Returns up to 30 vegan-tagged products matching the search term at the given store.
    Upserts results into CachedProduct / ProductPrice as a side effect.
    Call StoresByZip first so the store exists in CachedStore.
    """
    def post(self, request):
        location_id = request.data.get('location_id', '').strip()
        search_term = request.data.get('search_term', '').strip()

        if not location_id or not search_term:
            return Response(
                {'error': 'location_id and search_term are both required'},
                status=s.HTTP_400_BAD_REQUEST,
            )

        try:
            products = get_products_by_search_term(location_id, search_term)
        except CachedStore.DoesNotExist:
            return Response(
                {'error': f'Store {location_id!r} not found. Fetch stores by zip code first.'},
                status=s.HTTP_404_NOT_FOUND,
            )
        except KrogerAPIError as e:
            return Response(
                {'error': 'Kroger API error', 'detail': str(e)},
                status=s.HTTP_502_BAD_GATEWAY,
            )

        return Response(products, status=s.HTTP_200_OK)


class ProductDetailByLocation(APIView):
    """
    POST /api/v1/kroger/products/detail/
    Body: { "location_id": "01400376", "upc": "0001111042058" }
    Returns full product details and store-specific price.
    Reads from cache if available; otherwise fetches from the Kroger API and caches the result.
    """
    def post(self, request):
        location_id = request.data.get('location_id', '').strip()
        upc = request.data.get('upc', '').strip()
        if not location_id or not upc:
            return Response(
                {'error': 'location_id and upc are both required'},
                status=s.HTTP_400_BAD_REQUEST,
            )
        try:
            product = get_product_details(upc, location_id)
        except CachedStore.DoesNotExist:
            return Response(
                {'error': f'Store {location_id!r} not found. Fetch stores by zip code first.'},
                status=s.HTTP_404_NOT_FOUND,
            )
        except KrogerAPIError as e:
            return Response(
                {'error': 'Kroger API error', 'detail': str(e)},
                status=s.HTTP_502_BAD_GATEWAY,
            )
        return Response(product, status=s.HTTP_200_OK)
