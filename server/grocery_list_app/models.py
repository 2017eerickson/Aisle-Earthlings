from django.db import models
from users_app.models import AppUser
from products_app.models import Product
from stores_app.models import Store

# Create your models here.
class GroceryList(models.Model):
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name='grocery_list')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Grocery List"
    
    
class GroceryListItem(models.Model):
    grocery_list = models.ForeignKey(
        GroceryList, 
        on_delete=models.CASCADE, 
        related_name='items'
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField(default=1)
    is_purchased = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"