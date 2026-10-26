from django.urls import path
from .views import *

urlpatterns = [
    path("", Info.as_view()),
    path("create/", CreateUser.as_view(), name='create_user'),
    path("login/", LogIn.as_view(), name='login_user'),
    path("logout/", LogOut.as_view(), name='logout_user'),
    path("forgot-password/", ForgotPassword.as_view(), name='forgot_password'),
    path("reset-password/", ResetPassword.as_view(), name='reset_password'),
]