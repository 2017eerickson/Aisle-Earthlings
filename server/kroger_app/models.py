from django.db import models

# Create your models here.

class CachedStore(models.Model):
    """
    A Kroger store location fetched from the Kroger Locations API.
    Populated when a user looks up stores by zip code.

    location_id is Kroger's own identifier — used as the primary key
    so lookups are direct without a secondary index.

    distance_miles is relative to the zip that last fetched this store.
    It is display-only and does not need to be precise across all users.
    """
    location_id = models.CharField(
        primary_key=True,
        max_length=20,
        help_text='Kroger locationId, e.g. "01400376".',
    )
    name = models.CharField(
        max_length=100,
        help_text='Store banner name, e.g. "Kroger".',
    )
    store_number = models.CharField(
        max_length=10,
        blank=True,
        default='',
        help_text='Store number, e.g. "632". Combined with name for display.',
    )
    address_line = models.CharField(max_length=255, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    state = models.CharField(max_length=2, blank=True, default='')
    zip_code = models.CharField(max_length=10, blank=True, default='')
    searched_zip = models.CharField(
        max_length=10,
        blank=True,
        default='',
        help_text='The zip code that was queried when this store was cached.',
    )
    
    distance_miles = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Miles from the zip that last fetched this store. Approximate.',
    )
    # Gemini store info
    logo_url = models.URLField(
        blank=True,
        default='',
        help_text='Constructed from chain domain via Clearbit logo API.',
    )
    hours = models.TextField(
        blank=True,
        default='',
        help_text='Typical chain hours as returned by Gemini, e.g. "Mon–Sun 6am–11pm".',
    )
    review_summary = models.TextField(
        blank=True,
        default='',
        help_text='2–3 sentence customer sentiment summary from Gemini.',
    )
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        null=True,
        blank=True,
        help_text='Typical customer rating (e.g. 4.2) as reported by Gemini.',
    )
    info_checked = models.BooleanField(
        default=False,
        help_text='True once Gemini has been called for store info, regardless of result.',
    )

    cached_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'cached store'
        verbose_name_plural = 'cached stores'

    def __str__(self):
        return self.display_name

    @property
    def display_name(self):
        """e.g. 'Kroger #632 · Frederick, MD'"""
        num = f' #{self.store_number}' if self.store_number else ''
        loc = f' · {self.city}, {self.state}' if self.city else ''
        return f'{self.name}{num}{loc}'


class CachedProduct(models.Model):
    """
    A Kroger product keyed by UPC.
    Holds product identity, images, and vegan verification status.

    No price or location_id here — those live on ProductPrice.
    This means one product row covers all stores, and the Gemini
    vegan check is done once per product regardless of how many
    stores carry it.
    """
    upc = models.CharField(
        primary_key=True,
        max_length=20,
        help_text='Universal Product Code as returned by Kroger API.',
    )
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=100, blank=True, default='')
    categories = models.CharField(
        max_length=200,
        blank=True,
        default='',
        help_text='Comma-separated Kroger categories e.g. "Dairy". Used in Gemini vegan prompt.',
    )
    description = models.TextField(blank=True, default='')

    # Kroger image URLs — pattern:
    # https://www.kroger.com/product/images/{size}/{perspective}/{upc}
    # size options:   thumbnail, small, medium, large, xlarge
    # perspective:    front, back, left, right
    image_front = models.URLField(blank=True, default='')
    image_back = models.URLField(
        blank=True,
        default='',
        help_text='Back-of-pack image. Passed to Gemini Vision for vegan verification.',
    )
    image_left = models.URLField(blank=True, default='')
    image_right = models.URLField(blank=True, default='')

    # Gemini vegan verification
    # is_vegan=None + vegan_checked=False  → never checked  → show "Check if vegan" button
    # is_vegan=True + vegan_checked=True   → vegan          → green badge
    # is_vegan=False + vegan_checked=True  → not vegan      → red badge
    # is_vegan=None + vegan_checked=True   → uncertain      → amber badge
    is_vegan = models.BooleanField(null=True, default=None)
    vegan_checked = models.BooleanField(
        default=False,
        help_text='True once Gemini has been called, regardless of result.',
    )

    cached_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'cached product'
        verbose_name_plural = 'cached products'

    def __str__(self):
        return f'{self.name} ({self.upc})'

    @property
    def vegan_status(self):
        """Human-readable vegan status for API responses."""
        if not self.vegan_checked:
            return 'unchecked'
        if self.is_vegan is True:
            return 'vegan'
        if self.is_vegan is False:
            return 'not_vegan'
        return 'uncertain'

    @property
    def primary_image(self):
        return self.image_front or self.image_back or ''


class ProductPrice(models.Model):
    """
    Price and availability of a product at a specific store.
    This is the join table between CachedProduct and CachedStore.

    One row per (product, store) pair, updated on every search that
    returns that product at that location.

    Why a separate table:
    - Same UPC can have different prices at different stores
    - Vegan status on CachedProduct applies across all stores
    - Compare-stores page queries prices by store efficiently via the index
    """
    product = models.ForeignKey(
        CachedProduct,
        on_delete=models.CASCADE,
        related_name='prices',
    )
    store = models.ForeignKey(
        CachedStore,
        on_delete=models.CASCADE,
        related_name='product_prices',
    )
    price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
    )
    price_per_unit = models.CharField(
        max_length=50,
        blank=True,
        default='',
        help_text='e.g. "$0.08 / oz" as returned by Kroger.',
    )
    in_stock = models.BooleanField(default=True)
    sold_by = models.CharField(
        max_length=20,
        blank=True,
        default='',
        help_text='e.g. "UNIT" or "WEIGHT" from Kroger items[].soldBy.',
    )
    size = models.CharField(
        max_length=50,
        blank=True,
        default='',
        help_text='e.g. "1 gal" from Kroger items[].size.',
    )
    cached_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'product price'
        verbose_name_plural = 'product prices'
        unique_together = [('product', 'store')]
        indexes = [
            models.Index(fields=['store']),
            models.Index(fields=['product', 'store']),
        ]

    def __str__(self):
        price_str = f'${self.price}' if self.price else 'no price'
        return f'{self.product.name} @ {self.store.display_name} — {price_str}'


