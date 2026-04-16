from django.urls import path
from .views import VeganCheck

urlpatterns = [
    path('vegan/<str:upc>/', VeganCheck.as_view(), name='vegan_check'),
]
