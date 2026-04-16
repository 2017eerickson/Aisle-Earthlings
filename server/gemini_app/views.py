from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as s

from kroger_app.models import CachedProduct
from .gemini_utils import check_vegan_by_upc, GeminiAPIError


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
