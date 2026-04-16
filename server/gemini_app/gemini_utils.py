"""
gemini_app/gemini_utils.py
==========================

Utility for calling the Gemini API to verify whether a product is vegan.

Functions:
    check_vegan_by_upc(upc)
        → Checks CachedProduct first. If already verified, returns the product
          and cached=True immediately. Otherwise calls Gemini, saves the result
          back to CachedProduct, and returns cached=False.

Gemini is called with the product's name, brand, categories, and description.
If image_back is available on the CachedProduct, it is fetched and passed to
Gemini Vision (back-of-pack) for a more reliable ingredients-based result.
Falls back to text-only if the image fetch fails.

Gemini is prompted to respond with a JSON object:
    {"is_vegan": true/false/null, "reason": "..."}

is_vegan mapping:
    True  → vegan
    False → not vegan
    None  → uncertain (not enough information)

These map to the vegan_status property on CachedProduct:
    True  → "vegan"
    False → "not_vegan"
    None  → "uncertain"
"""

import json
import logging

import requests
import google.generativeai as genai
from django.conf import settings

from kroger_app.models import CachedProduct

logger = logging.getLogger(__name__)

GEMINI_MODEL = 'gemini-3.1-flash-lite-preview'

_PROMPT = """\
You are a vegan product verification assistant.

Analyze the product below and determine if it is vegan \
(free from all animal products and byproducts, including meat, dairy, eggs, honey, gelatin, etc.).

Product Name: {name}
Brand: {brand}
Categories: {categories}
Description: {description}

{image_note}

Respond ONLY with a JSON object — no markdown, no extra text:
  {{"is_vegan": true, "reason": "brief explanation"}}
  {{"is_vegan": false, "reason": "brief explanation"}}
  {{"is_vegan": null, "reason": "not enough information to determine"}}
"""


class GeminiAPIError(Exception):
    pass


def _build_parts(product):
    """
    Build the content parts list for Gemini.
    Returns a list containing the text prompt, and optionally an image part
    if image_back is present and fetchable.
    """
    image_note = ''
    image_part = None

    if product.image_back:
        try:
            resp = requests.get(product.image_back, timeout=10)
            resp.raise_for_status()
            mime = resp.headers.get('Content-Type', 'image/jpeg').split(';')[0].strip()
            image_part = genai.protos.Part(
                inline_data=genai.protos.Blob(mime_type=mime, data=resp.content)
            )
            image_note = 'The back-of-pack image is also provided — use it to check ingredients.'
            logger.debug('image_back fetched for upc %s (%d bytes)', product.upc, len(resp.content))
        except requests.RequestException as e:
            logger.warning(
                'Could not fetch image_back for upc %s: %s — using text-only prompt',
                product.upc, e,
            )

    prompt = _PROMPT.format(
        name=product.name,
        brand=product.brand,
        categories=product.categories,
        description=product.description,
        image_note=image_note,
    )

    parts = [prompt]
    if image_part:
        parts.append(image_part)
    return parts


def _parse_gemini_response(raw, upc):
    """
    Parse Gemini's JSON response into an is_vegan value (True/False/None).
    Returns None on parse failure and logs a warning.
    """
    text = raw.strip()

    # Strip markdown code fences if present
    if text.startswith('```'):
        text = text.split('\n', 1)[1].rsplit('```', 1)[0].strip()

    try:
        data = json.loads(text)
        return data.get('is_vegan')  # True, False, or None
    except (json.JSONDecodeError, AttributeError) as e:
        logger.warning(
            'Failed to parse Gemini JSON for upc %s: %s — raw: %.200s',
            upc, e, raw,
        )
        return None


def check_vegan_by_upc(upc):
    """
    Return vegan status for the given UPC.

    Cache-first: if CachedProduct.vegan_checked is True, returns immediately
    without calling Gemini.

    Args:
        upc (str): Product UPC, must exist in CachedProduct.

    Returns:
        tuple(CachedProduct, bool): The updated product and a boolean
        indicating whether the result came from cache (True) or a fresh
        Gemini call (False).

    Raises:
        CachedProduct.DoesNotExist: If the UPC is not in the cache.
        GeminiAPIError: If the Gemini API call fails.
    """
    product = CachedProduct.objects.get(upc=upc)

    if product.vegan_checked:
        logger.debug('Vegan cache hit for upc %s — status: %s', upc, product.vegan_status)
        return product, True

    logger.info('Vegan cache miss for upc %s — calling Gemini', upc)

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(GEMINI_MODEL)

    parts = _build_parts(product)

    try:
        response = model.generate_content(parts)
        raw = response.text
    except Exception as e:
        raise GeminiAPIError(f'Gemini API call failed for upc {upc}: {e}') from e

    product.is_vegan = _parse_gemini_response(raw, upc)
    product.vegan_checked = True
    product.save(update_fields=['is_vegan', 'vegan_checked'])

    logger.info('Vegan check complete for upc %s — status: %s', upc, product.vegan_status)
    return product, False
