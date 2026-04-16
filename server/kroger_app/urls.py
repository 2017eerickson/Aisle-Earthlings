from django.urls import path
from .views import StoresByZip, KrogerProductSearch, ProductDetailByLocation

urlpatterns = [
    path('stores/by-zip/', StoresByZip.as_view(), name='stores_by_zip'),
    path('search/products/', KrogerProductSearch.as_view(), name='product_search'),
    path('products/detail/', ProductDetailByLocation.as_view(), name='product_detail'),
]
