from django.db import models

from django.conf import settings

class ShoppingList(models.Model):
    """
    Each user has exactly one shopping list (OneToOne).
    Auto-created by the post_save signal on CustomUser above.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shopping_list',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'List({self.user.email})'

    @property
    def item_count(self):
        return self.items.count()



class ShoppingListItem(models.Model):
    """
    One item on a user's shopping list.

    upc is a soft CharField reference to CachedProduct.upc — not a hard FK.
    product_name is denormalized so the list is readable without a DB join.
    Both choices mean list items survive cache clears and UPC misses.

    product_store_id records which store the user was browsing when
    they added the item — useful display context, not enforced.
    """
    list = models.ForeignKey(
        ShoppingList,
        on_delete=models.CASCADE,
        related_name='items',
    )
    
    product_name = models.CharField(
        max_length=255,
        help_text='Denormalized for display without a CachedProduct lookup.',
    )
    product_store_id = models.CharField(
        max_length=20,
        blank=True,
        default='',
        help_text='location_id of the store the user added this item from.',
    )
    store_name = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text='Denormalized store display name so the list is readable without a Kroger API call.',
    )
    store_address = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text='Denormalized store address line.',
    )
    quantity = models.PositiveSmallIntegerField(default=1)
    
    checked = models.BooleanField(default=False)
    
    upc = models.CharField(
        max_length=20,
        blank=True,
        default='',
        help_text='Soft reference to CachedProduct.upc for convenience.',
    )

    class Meta:
        verbose_name = 'shopping list item'
        verbose_name_plural = 'shopping list items'

    def __str__(self):
        status = 'done' if self.checked else 'open'
        return f'[{status}] {self.product_name} x{self.quantity}'

    @property
    def cached_product(self):
        """Convenience accessor — returns CachedProduct or None."""
        try:
            from kroger_app.models import CachedProduct
            return CachedProduct.objects.get(upc=self.upc)
        except Exception:
            return None

