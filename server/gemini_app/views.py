from rest_framework.response import Response
from rest_framework import status as s

from kroger_app.models import CachedProduct
from users_app.views import UserView
from .gemini_utils import check_vegan_by_upc, GeminiAPIError

GEMINI_VEGAN_LIMIT = 10


class VeganCheck(UserView):
    """
    GET /api/v1/gemini/vegan/<upc>/

    Returns vegan status for the given UPC.
    Reads from CachedProduct if already verified; calls Gemini otherwise.

    Each user gets 10 fresh Gemini calls (cache hits don't count).
    Returns 429 once the limit is reached.

    Responses:
        200 — { upc, product_name, vegan_status, is_vegan, cached }
        404 — product not in cache (fetch from Kroger first)
        429 — user has reached their Gemini check limit
        502 — Gemini API error
    """

    def get(self, request, upc):
        profile = request.user.profile

        if profile.gemini_uses >= GEMINI_VEGAN_LIMIT:
            return Response(
                {
                    'error': 'limit_reached',
                    'detail': f'You have used all {GEMINI_VEGAN_LIMIT} Gemini vegan checks.',
                },
                status=s.HTTP_429_TOO_MANY_REQUESTS,
            )

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

        if not cached:
            profile.gemini_uses += 1
            profile.save(update_fields=['gemini_uses'])

        return Response({
            'upc': product.upc,
            'product_name': product.name,
            'vegan_status': product.vegan_status,
            'is_vegan': product.is_vegan,
            'cached': cached,
        }, status=s.HTTP_200_OK)
