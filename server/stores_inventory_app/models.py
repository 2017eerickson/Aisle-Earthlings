from django.db import models
from stores_app.models import Store
from products_app.models import Product

class StoreInventory(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='inventory')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stocked_at')
    
    # Store-specific data
    price = models.DecimalField(max_digits=10, decimal_places=2)
    on_sale = models.BooleanField(default=False)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    in_stock = models.BooleanField(default=True)
    stock_level = models.IntegerField(default=0)  # Actual count or rough estimate

    class Meta:
        # Prevents duplicate entries for the same product in the same store
        unique_together = ('store', 'product')
        verbose_name_plural = "Store Inventories"

    def __str__(self):
        return f"{self.product.name} at {self.store.name}"