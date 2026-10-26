from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from .models import AppUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework.permissions import IsAuthenticated
from rest_framework import status as s
from .serializers import AppUserSerializer
from datetime import datetime, timedelta
from .utilities import CookieAuthentication, handle_exceptions

# Create your views here.
def create_time_for_cookie(days=0, minutes=2):
    life_time = datetime.now() + timedelta(days=days, minutes=minutes)
    format_time = life_time.strftime("%a, %d %b %Y %H:%M:%S GMT")
    return format_time
class CreateUser(APIView):
    authentication_classes = []
    permission_classes = []
    
    @handle_exceptions
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        if not email or not password:
            return Response({"error": "email and password are required"}, status=s.HTTP_400_BAD_REQUEST)
        try:
            new_user = AppUser.objects.create_user(email=email, password=password)
            refresh = RefreshToken.for_user(new_user)
            response = Response({"email": new_user.email, "id": new_user.id}, status=s.HTTP_201_CREATED)
            response.set_cookie(
                key='acess',
                value=str(refresh.access_token),
                httponly=True,
                samesite='Lax',
                secure=True,
                expires=create_time_for_cookie(minutes=15),
                )
            response.set_cookie(
                key='refresh',
                value=str(refresh),
                httponly=True,
                samesite='Lax',
                secure=True,
                expires=create_time_for_cookie(days=2),
                )
            return response
        except Exception as e:
            return Response(e.args, status=s.HTTP_400_BAD_REQUEST)

class UserView(APIView):
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticated]
class LogIn(APIView):
    authentication_classes = []
    permission_classes = []

    @handle_exceptions
    def post(self, request):
        username = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            response = Response({"email": user.email, "id": user.id}, status=s.HTTP_200_OK)
            response.set_cookie(
                key='acess',
                value=str(refresh.access_token),
                httponly=True,
                secure=True,
                samesite='Lax',
                expires=create_time_for_cookie(minutes=15)
            )
            response.set_cookie(
                key='refresh',
                value=str(refresh),
                httponly=True,
                secure=True,
                samesite='Lax',
                expires=create_time_for_cookie(days=2)
            )
            return response
        else:
            return Response("No user matching credentials", status=s.HTTP_404_NOT_FOUND)


class Info(UserView):
    @handle_exceptions
    def get(self, request):
        user = request.user
        return Response({ "email":user.email, "id": user.id }, status=s.HTTP_200_OK)

class LogOut(UserView):
    @handle_exceptions
    def post(self, request):
        user = request.user
        refresh_token = request.COOKIES.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except (TokenError, InvalidToken) as e:
                print(str(e))
                return Response(e.args, status=s.HTTP_400_BAD_REQUEST)
        response = Response(f"{user.email} has been logged out", status=s.HTTP_200_OK)
        response.delete_cookie('acess')
        response.delete_cookie('refresh')
        return response

class ForgotPassword(APIView):
    authentication_classes = []
    permission_classes = []

    @handle_exceptions
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=s.HTTP_400_BAD_REQUEST)

        # Always return 200 to prevent email enumeration
        try:
            user = AppUser.objects.get(email=email)
        except AppUser.DoesNotExist:
            return Response(
                {"message": "If an account with that email exists, a reset link has been sent."},
                status=s.HTTP_200_OK
            )

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

        send_mail(
            subject="Aisle Earthlings - Password Reset",
            message=f"Click the link below to reset your password:\n\n{reset_url}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(
            {"message": "If an account with that email exists, a reset link has been sent."},
            status=s.HTTP_200_OK
        )

class ResetPassword(APIView):
    authentication_classes = []
    permission_classes = []

    @handle_exceptions
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        password = request.data.get('password')

        if not uid or not token or not password:
            return Response(
                {"error": "uid, token, and password are required"},
                status=s.HTTP_400_BAD_REQUEST
            )

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = AppUser.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, AppUser.DoesNotExist):
            return Response({"error": "Invalid reset link"}, status=s.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response(
                {"error": "Reset link is invalid or has expired"},
                status=s.HTTP_400_BAD_REQUEST
            )

        try:
            validate_password(password, user)
        except Exception as e:
            return Response({"error": e.messages}, status=s.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save()

        return Response({"message": "Password has been reset successfully"}, status=s.HTTP_200_OK)


