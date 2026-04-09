from django.urls import path
from .views import *

urlpatterns = [
    path("", Info.as_view()),
    path("create/", CreateUser.as_view()),
    path("login/", LogIn.as_view()),
    path("logout/", LogOut.as_view()),
    path('main/', Main_Sign_Up.as_view(), name='main')

]