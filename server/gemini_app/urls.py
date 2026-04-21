from django.urls import path
from .views import VeganCheck, StoreInfo

urlpatterns = [
    path('vegan/<str:upc>/', VeganCheck.as_view(), name='vegan_check'),
    path('store-info/<str:location_id>/', StoreInfo.as_view(), name='store_info'),
]
