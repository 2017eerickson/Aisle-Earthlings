from rest_framework.response import Response
from rest_framework import status as s

from users_app.views import UserView
from .models import ShoppingList as ShoppingListModel, ShoppingListItem
from .serializers import ShoppingListSerializer, ShoppingListItemSerializer


class ShoppingList(UserView):
    """
    GET  /api/v1/list/  — return the logged-in user's list with all items
    POST /api/v1/list/  — add an item to the logged-in user's list
        Body: { upc, product_name, product_store_id, quantity }
    """

    def get(self, request):
        shopping_list, _ = ShoppingListModel.objects.get_or_create(user=request.user)
        return Response(ShoppingListSerializer(shopping_list).data, status=s.HTTP_200_OK)

    def post(self, request):
        shopping_list, _ = ShoppingListModel.objects.get_or_create(user=request.user)
        serializer = ShoppingListItemSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=s.HTTP_400_BAD_REQUEST)
        serializer.save(list=shopping_list)
        return Response(serializer.data, status=s.HTTP_201_CREATED)


class ListItemRUD(UserView):
    """
    PATCH  /api/v1/list/items/<item_id>/  — update item (checked, quantity)
    DELETE /api/v1/list/items/<item_id>/  — remove item
    """

    def _get_item(self, request, item_id):
        try:
            return ShoppingListItem.objects.get(pk=item_id, list__user=request.user), None
        except ShoppingListItem.DoesNotExist:
            return None, Response({'error': 'Item not found'}, status=s.HTTP_404_NOT_FOUND)

    def patch(self, request, item_id):
        item, error = self._get_item(request, item_id)
        if error:
            return error
        serializer = ShoppingListItemSerializer(item, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=s.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=s.HTTP_200_OK)

    def delete(self, request, item_id):
        item, error = self._get_item(request, item_id)
        if error:
            return error
        item.delete()
        return Response(status=s.HTTP_204_NO_CONTENT)
