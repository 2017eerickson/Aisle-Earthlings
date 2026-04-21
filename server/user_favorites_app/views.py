from rest_framework.response import Response
from rest_framework import status as s

from users_app.views import UserView
from .models import UserFavorite
from .serializers import UserFavoriteSerializer


class FavoriteListCreate(UserView):
    """
    GET  /api/v1/favorites/         — list current user's favorites
    POST /api/v1/favorites/         — add a favorite
        Body: { favorite_type: 'product'|'store', reference_id: str }
    """

    def get(self, request):
        favorites = UserFavorite.objects.filter(user=request.user)
        return Response(UserFavoriteSerializer(favorites, many=True).data)

    def post(self, request):
        serializer = UserFavoriteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=s.HTTP_400_BAD_REQUEST)
        serializer.save(user=request.user)
        return Response(serializer.data, status=s.HTTP_201_CREATED)


class FavoriteDelete(UserView):
    """
    DELETE /api/v1/favorites/<id>/  — remove a favorite
    """

    def delete(self, request, pk):
        try:
            favorite = UserFavorite.objects.get(pk=pk, user=request.user)
        except UserFavorite.DoesNotExist:
            return Response({'error': 'Not found.'}, status=s.HTTP_404_NOT_FOUND)
        favorite.delete()
        return Response(status=s.HTTP_204_NO_CONTENT)
