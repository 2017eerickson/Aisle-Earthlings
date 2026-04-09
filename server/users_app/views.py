from django.contrib.auth import login, authenticate, logout
from .models import AppUser
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status as s
# from serializers import AppUserSerializer

# Create your views here.
class CreateUser(APIView):
    authentication_classes = []
    permission_classes = []
    
    def post(self, request):
        user = {
                "email" : request.data.get('email'),
                "password" : request.data.get('password'),
                "username" : request.data.get('email')
                }
        new_user = AppUser.objects.create_user(**user)
        try:
            new_user.full_clean()
            new_user.save()
            token = Token.objects.create(user=new_user)
            return Response({"token":token.key, "email":new_user.email}, status=s.HTTP_201_CREATED)
        except Exception as e:
            return Response(e.args, status=s.HTTP_400_BAD_REQUEST)

class LogIn(APIView):
# {
#     "token": "f5191ec1f11e194d775a419e57b11af047eab087",
#     "email": "t@test.com"
# }
    def post(self, request):
        data = request.data
        username = request.data.get('email')
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(
            username=username, 
            password=password)
        if user:
            Token.objects.get_or_create(user=user)
            return Response({"token":user.auth_token.key, "email":user.email})
        else:
            return Response("No user matching credentials", status=s.HTTP_404_NOT_FOUND)

class UserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]


class Info(UserView):
    def get(self, request):
        user = request.user
        return Response({"token":user.auth_token.key, "email":user.email})

class LogOut(UserView):
    def post(self, request):
        user = request.user
        user.auth_token.delete()
        return Response(f"{user.email} has been logged out")


class Main_Sign_Up(APIView):

    def post(self, request):
        user = {
                "email" : request.data.get('email'),
                "password" : request.data.get('password'),
                "username" : request.data.get('email')
                }
        main_trainer = AppUser.objects.create_user(**user)
        main_trainer.is_staff = True
        main_trainer.is_superuser = True
        main_trainer.save()
        token = Token.objects.create(user=main_trainer)
        return Response(
            {"main_trainer": main_trainer.email, "token": token.key}, status=s.HTTP_201_CREATED
        )