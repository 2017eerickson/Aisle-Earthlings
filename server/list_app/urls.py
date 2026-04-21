from django.urls import path
from .views import ListItemRUD, ShoppingList

urlpatterns = [
    path('', ShoppingList.as_view(), name='shopping_list'),
    path('items/<int:item_id>/', ListItemRUD.as_view(), name='list_item_detail'),
]
