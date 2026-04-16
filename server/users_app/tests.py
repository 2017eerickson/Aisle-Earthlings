from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from .models import AppUser

# Helpers
INFO_URL = '/api/v1/users/'


def make_user(email='user@example.com', password='testpass123', **kwargs):
    """Create a user without relying on the manager's username arg."""
    user = AppUser(email=email, **kwargs)
    user.set_password(password)
    user.save()
    return user


def auth_cookies(user):
    """Return (access_token_str, refresh_token_str) for a user."""
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token), str(refresh)


# ---------------------------------------------------------------------------
# POST /api/v1/users/create/
# ---------------------------------------------------------------------------
class CreateUserTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('create_user')

    def test_valid_registration_returns_201(self):
        response = self.client.post(self.url, {'email': 'new@example.com', 'password': 'strongpass1'})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['email'], 'new@example.com')

    def test_valid_registration_sets_acess_and_refresh_cookies(self):
        response = self.client.post(self.url, {'email': 'new@example.com', 'password': 'strongpass1'})
        self.assertIn('acess', response.cookies)
        self.assertIn('refresh', response.cookies)
        self.assertTrue(response.cookies['acess'].value)
        self.assertTrue(response.cookies['refresh'].value)

    def test_valid_registration_creates_user_in_db(self):
        self.client.post(self.url, {'email': 'new@example.com', 'password': 'strongpass1'})
        self.assertTrue(AppUser.objects.filter(email='new@example.com').exists())

    def test_duplicate_email_returns_400(self):
        make_user(email='taken@example.com')
        response = self.client.post(self.url, {'email': 'taken@example.com', 'password': 'strongpass1'})
        self.assertEqual(response.status_code, 400)

    def test_missing_email_returns_error(self):
        response = self.client.post(self.url, {'password': 'strongpass1'})
        self.assertGreaterEqual(response.status_code, 400)

    def test_missing_password_returns_error(self):
        response = self.client.post(self.url, {'email': 'new@example.com'})
        self.assertGreaterEqual(response.status_code, 400)


# ---------------------------------------------------------------------------
# POST /api/v1/users/login/
# ---------------------------------------------------------------------------
class LogInTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('login_user')
        self.user = make_user(email='user@example.com', password='testpass123')

    def test_valid_credentials_return_200(self):
        response = self.client.post(self.url, {'email': 'user@example.com', 'password': 'testpass123'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['email'], 'user@example.com')

    def test_valid_login_sets_acess_cookie(self):
        response = self.client.post(self.url, {'email': 'user@example.com', 'password': 'testpass123'})
        # Regression for Bug 2: cookie key must be 'acess', not 'access'
        self.assertIn('acess', response.cookies)
        self.assertNotIn('access', response.cookies)

    def test_valid_login_sets_refresh_cookie(self):
        response = self.client.post(self.url, {'email': 'user@example.com', 'password': 'testpass123'})
        self.assertIn('refresh', response.cookies)
        self.assertTrue(response.cookies['refresh'].value)

    def test_wrong_password_returns_404(self):
        response = self.client.post(self.url, {'email': 'user@example.com', 'password': 'wrongpassword'})
        self.assertEqual(response.status_code, 404)

    def test_nonexistent_user_returns_404(self):
        response = self.client.post(self.url, {'email': 'ghost@example.com', 'password': 'testpass123'})
        self.assertEqual(response.status_code, 404)

    def test_login_accessible_without_existing_auth_cookie(self):
        # Regression for Bug 1: login must not require authentication
        response = self.client.post(self.url, {'email': 'user@example.com', 'password': 'testpass123'})
        self.assertNotEqual(response.status_code, 403)


# ---------------------------------------------------------------------------
# GET /api/v1/users/
# ---------------------------------------------------------------------------
class InfoTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = INFO_URL
        self.user = make_user(email='user@example.com', password='testpass123')
        self.access, self.refresh = auth_cookies(self.user)

    def test_valid_cookie_returns_200_with_email(self):
        self.client.cookies['acess'] = self.access
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['email'], 'user@example.com')

    def test_no_cookie_returns_401(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    def test_invalid_token_returns_401(self):
        self.client.cookies['acess'] = 'not.a.valid.token'
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    def test_cookie_from_login_authenticates_info(self):
        # Full flow: login → use cookie → get info
        login_response = self.client.post(reverse('login_user'), {
            'email': 'user@example.com',
            'password': 'testpass123',
        })
        self.client.cookies['acess'] = login_response.cookies['acess'].value
        info_response = self.client.get(self.url)
        self.assertEqual(info_response.status_code, 200)


# ---------------------------------------------------------------------------
# POST /api/v1/users/logout/
# ---------------------------------------------------------------------------
class LogOutTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('logout_user')
        self.user = make_user(email='user@example.com', password='testpass123')
        self.access, self.refresh = auth_cookies(self.user)

    def _set_cookies(self):
        self.client.cookies['acess'] = self.access
        self.client.cookies['refresh'] = self.refresh

    def test_valid_cookies_return_200(self):
        self._set_cookies()
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 200)

    def test_logout_clears_acess_cookie(self):
        self._set_cookies()
        response = self.client.post(self.url)
        self.assertEqual(response.cookies['acess'].value, '')

    def test_logout_clears_refresh_cookie(self):
        self._set_cookies()
        response = self.client.post(self.url)
        self.assertEqual(response.cookies['refresh'].value, '')

    def test_logout_blacklists_refresh_token(self):
        self._set_cookies()
        self.client.post(self.url)
        self.assertEqual(BlacklistedToken.objects.count(), 1)

    def test_no_cookie_returns_401(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 401)

    def test_blacklisted_token_cannot_authenticate(self):
        self._set_cookies()
        self.client.post(self.url)  # logout — blacklists token
        # Try to use the same access token after logout
        response = self.client.get(INFO_URL)
        self.assertNotEqual(response.status_code, 200)


# ---------------------------------------------------------------------------
# POST /api/v1/users/main/
# ---------------------------------------------------------------------------
class MainSignUpTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('main_user_sign_up')

    def test_creates_superuser_returns_201(self):
        response = self.client.post(self.url, {'email': 'admin@example.com', 'password': 'adminpass123'})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['main_trainer'], 'admin@example.com')

    def test_superuser_has_staff_and_superuser_flags(self):
        self.client.post(self.url, {'email': 'admin@example.com', 'password': 'adminpass123'})
        user = AppUser.objects.get(email='admin@example.com')
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)

    def test_sets_jwt_cookies(self):
        response = self.client.post(self.url, {'email': 'admin@example.com', 'password': 'adminpass123'})
        self.assertIn('acess', response.cookies)
        self.assertIn('refresh', response.cookies)
        self.assertTrue(response.cookies['acess'].value)
