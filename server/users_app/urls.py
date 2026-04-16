from django.urls import path
from .views import *

urlpatterns = [
    path("", Info.as_view()),
    path("create/", CreateUser.as_view(), name='create_user'),
    path("login/", LogIn.as_view(), name='login_user'),
    path("logout/", LogOut.as_view(), name='logout_user'),
    path('main/', Main_Sign_Up.as_view(), name='main_user_sign_up')

]