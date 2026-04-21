from rest_framework import serializers
from .models import CachedStore, CachedProduct, ProductPrice


class CachedStoreSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)

    class Meta:
        model = CachedStore
        fields = [
            'location_id', 'name', 'store_number', 'address_line',
            'city', 'state', 'zip_code',
            'distance_miles', 'cached_at', 'display_name',
        ]


class CachedProductSerializer(serializers.ModelSerializer):
    vegan_status = serializers.CharField(read_only=True)
    primary_image = serializers.CharField(read_only=True)

    class Meta:
        model = CachedProduct
        fields = [
            'upc', 'name', 'brand', 'categories', 'description',
            'image_front', 'image_back', 'image_left', 'image_right',
            'is_vegan', 'vegan_checked', 'vegan_status', 'primary_image',
            'cached_at',
        ]


class ProductPriceSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    store_display_name = serializers.CharField(source='store.display_name', read_only=True)

    class Meta:
        model = ProductPrice
        fields = [
            'id', 'product', 'product_name', 'store', 'store_display_name',
            'price', 'price_per_unit', 'in_stock', 'sold_by', 'size', 'cached_at',
        ]
