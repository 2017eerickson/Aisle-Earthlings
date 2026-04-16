from rest_framework import serializers

from .models import ShoppingList, ShoppingListItem


class ShoppingListItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShoppingListItem
        fields = [
            'id', 'upc', 'product_name', 'product_store_id',
            'quantity', 'checked'
        ]
        read_only_fields = ['id', 'upc', 'product_name', 'product_store_id']


class ShoppingListSerializer(serializers.ModelSerializer):
    items = ShoppingListItemSerializer(many=True, read_only=True)
    item_count = serializers.IntegerField(read_only=True)
    unchecked_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ShoppingList
        fields = ['id', 'item_count', 'items', 'created_at']
