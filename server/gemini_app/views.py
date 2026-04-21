from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as s

from kroger_app.models import CachedProduct
from kroger_app.models import CachedStore
from .gemini_utils import check_vegan_by_upc, get_store_info, GeminiAPIError
from rest_framework.throttling import UserRateThrottle

class VeganCheck(APIView):
    """
    GET /api/v1/gemini/vegan/<upc>/

    Returns vegan status for the given UPC.
    Reads from CachedProduct if already verified; calls Gemini otherwise.

    Responses:
        200 — { upc, product_name, vegan_status, is_vegan, cached }
        404 — product not in cache (fetch from Kroger first)
        502 — Gemini API error
    """
    throttle_classes = [UserRateThrottle]
    
    def get(self, request, upc):
        try:
            product, cached = check_vegan_by_upc(upc)
        except CachedProduct.DoesNotExist:
            return Response(
                {'error': 'Product not found. Fetch the product from Kroger first.'},
                status=s.HTTP_404_NOT_FOUND,
            )
        except GeminiAPIError as e:
            return Response(
                {'error': 'Gemini API error', 'detail': str(e)},
                status=s.HTTP_502_BAD_GATEWAY,
            )

        return Response({
            'upc': product.upc,
            'product_name': product.name,
            'vegan_status': product.vegan_status,
            'is_vegan': product.is_vegan,
            'cached': cached,
        }, status=s.HTTP_200_OK)


class StoreInfo(APIView):
    """
    GET /api/v1/gemini/store-info/<location_id>/

    Returns logo URL, hours, review summary, and rating for a store.
    Reads from CachedStore if already checked; calls Gemini otherwise.
    Store must exist in CachedStore — fetch via StoresByZip first.

    Responses:
        200 — { location_id, store_name, logo_url, hours, review_summary, rating, cached }
        404 — store not in cache
        502 — Gemini API error
    """
    throttle_classes = [UserRateThrottle]

    def get(self, request, location_id):
        try:
            store, cached = get_store_info(location_id)
        except CachedStore.DoesNotExist:
            return Response(
                {'error': 'Store not found. Fetch stores by zip code first.'},
                status=s.HTTP_404_NOT_FOUND,
            )
        except GeminiAPIError as e:
            return Response(
                {'error': 'Gemini API error', 'detail': str(e)},
                status=s.HTTP_502_BAD_GATEWAY,
            )

        return Response({
            'location_id': store.location_id,
            'store_name': store.display_name,
            'logo_url': store.logo_url,
            'hours': store.hours,
            'review_summary': store.review_summary,
            'rating': store.rating,
            'cached': cached,
        }, status=s.HTTP_200_OK)
