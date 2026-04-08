from django.db import models

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('protein', 'Protein'),
        ('dairy', 'Dairy'),
        ('frozen', 'Frozen'),
        ('pantry', 'Pantry'),
    ]

    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=100, blank=True, null=True)
    upc = models.CharField(max_length=14, unique=True)
    
    # New category field with specific choices
    category = models.CharField(
        max_length=20, 
        choices=CATEGORY_CHOICES,
        default='pantry'
    )
    
    def __str__(self):
        return f"{self.name} ({self.category})"

