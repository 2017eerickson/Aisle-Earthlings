from django.urls import path
from .views import StoresByZip, StoreDetail, KrogerProductSearch, ProductSearchByTerm, ProductDetailByLocation

urlpatterns = [
    path('stores/by-zip/', StoresByZip.as_view(), name='stores_by_zip'),
    path('stores/<str:location_id>/', StoreDetail.as_view(), name='store_detail'),
    path('search/products/', KrogerProductSearch.as_view(), name='product_search'),
    path('search/products/by-term/', ProductSearchByTerm.as_view(), name='product_search_by_term'),
    path('products/detail/', ProductDetailByLocation.as_view(), name='product_detail'),
]
