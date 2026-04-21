from django.db import models
from django.conf import settings


class UserFavorite(models.Model):
    PRODUCT = 'product'
    STORE = 'store'
    TYPE_CHOICES = [
        (PRODUCT, 'Product'),
        (STORE, 'Store'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorites',
    )
    favorite_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    reference_id = models.CharField(
        max_length=50,
        help_text='UPC for products, location_id for stores.',
    )
    location_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text='Kroger location_id — only applicable for product favorites.',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'favorite_type', 'reference_id')

    def __str__(self):
        return f'{self.user.email} — {self.favorite_type}:{self.reference_id}'
