from django.db import models

class Store(models.Model):
    # Standard identity fields
    name = models.CharField(max_length=255)
    retailer_id = models.CharField(max_length=100)
    
    # Address and Location
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2)  # Assuming 2-letter codes (e.g., CA, MD)
    zipcode = models.CharField(max_length=10)
    
    # Metadata and Status
    is_active = models.BooleanField(default=True)
    
    features = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.name} ({self.zipcode})"

    class Meta:
        verbose_name = "Store"
        verbose_name_plural = "Stores"