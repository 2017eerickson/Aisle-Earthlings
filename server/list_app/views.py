from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as s

from .models import ShoppingList as ShoppingListModel, ShoppingListItem
from .serializers import ShoppingListSerializer, ShoppingListItemSerializer

User = get_user_model()


class ShoppingList(APIView):
    """
    GET /api/v1/list/<user_id>/
    Returns the user's shopping list with all items.
    """
    def get(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=s.HTTP_404_NOT_FOUND)

        shopping_list, _ = ShoppingListModel.objects.get_or_create(user=user)
        return Response(ShoppingListSerializer(shopping_list).data, status=s.HTTP_200_OK)
    
    """
    POST /api/v1/list/<user_id>/
        -Add an item to the user's shopping list.
        -Body: { upc, product_name, product_store_id, quantity }
    """
    def post(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=s.HTTP_404_NOT_FOUND)

        shopping_list, _ = ShoppingListModel.objects.get_or_create(user=user)

        serializer = ShoppingListItemSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=s.HTTP_400_BAD_REQUEST)

        serializer.save(list=shopping_list)
        return Response(serializer.data, status=s.HTTP_201_CREATED)

class ListItemCUD(APIView):
    """
    PATCH /api/v1/list/<user_id>/items/<item_id>/ — update item (e.g. check/uncheck, change quantity)
        -Body can include any of: { quantity, checked }
        -Only quantity and checked are currently supported for updates, but the endpoint is flexible for future additions
        
    DELETE /api/v1/list/<user_id>/items/<item_id>/ — remove item
    """

    def _get_item(self, user_id, item_id):
        try:
            return ShoppingListItem.objects.get(pk=item_id, list__user_id=user_id), None
        except ShoppingListItem.DoesNotExist:
            return None, Response({'error': 'Item not found'}, status=s.HTTP_404_NOT_FOUND)

    def patch(self, request, user_id, item_id):
        item, error = self._get_item(user_id, item_id)
        if error:
            return error

        serializer = ShoppingListItemSerializer(item, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=s.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=s.HTTP_200_OK)

    def delete(self, request, user_id, item_id):
        item, error = self._get_item(user_id, item_id)
        if error:
            return error

        item.delete()
        return Response(status=s.HTTP_204_NO_CONTENT)
