from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions
from functools import wraps
from rest_framework.response import Response
from rest_framework import status as s

class CookieAuthentication(JWTAuthentication):
        
        def get_auth_cookie(self, request):
             return request.COOKIES.get('acess')
    
        def authenticate(self, request):
            acess_token = self.get_auth_cookie(request)

            if not acess_token:
                  raise exceptions.AuthenticationFailed("Authentication Cookie is not present")
            try :
                 validate_token = self.get_validated_token(acess_token)
                 return self.get_user(validate_token), validate_token
            except TokenError as e:  
                  raise exceptions.AuthenticationFailed(str(e))
        

def handle_exceptions(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            return Response({"errors": str(e)}, status=s.HTTP_500_INTERNAL_SERVER_ERROR)
    return wrapper