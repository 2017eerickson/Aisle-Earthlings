from django.urls import path
from .views import ListItemCUD, ShoppingList

urlpatterns = [
    path('<int:user_id>/', ShoppingList.as_view(), name='shopping_list_info'),
    path('<int:user_id>/items/<int:item_id>/', ListItemCUD.as_view(), name='list_item_detail'),
]
