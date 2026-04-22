from rest_framework.serializers import ModelSerializer
from .models import AppUser

class AppUserSerializer(ModelSerializer):
    class Meta:
        model = AppUser
        exclude = ['password', 'last_login', 'is_superuser', 'is_staff', 'is_active', 'date_joined', 'groups', 'user_permissions']