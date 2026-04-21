from rest_framework import serializers
from .models import UserFavorite


class UserFavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFavorite
        fields = ['id', 'favorite_type', 'reference_id', 'created_at']
        read_only_fields = ['id', 'created_at']
