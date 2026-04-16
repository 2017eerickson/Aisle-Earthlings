from django.test import TestCase
from rest_framework.test import APIClient

from users_app.models import AppUser
from .models import ShoppingList, ShoppingListItem


def make_user(email='user@example.com', password='testpass123'):
    user = AppUser(email=email)
    user.set_password(password)
    user.save()
    return user


def make_item(user, **kwargs):
    shopping_list, _ = ShoppingList.objects.get_or_create(user=user)
    defaults = {'product_name': 'Oat Milk', 'quantity': 1}
    defaults.update(kwargs)
    return ShoppingListItem.objects.create(list=shopping_list, **defaults)


# ---------------------------------------------------------------------------
# GET + POST  /api/v1/list/<user_id>/
# ---------------------------------------------------------------------------
class ShoppingListViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        self.url = f'/api/v1/list/{self.user.pk}/'

    def test_get_returns_200(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)

    def test_get_auto_creates_list_with_no_items(self):
        response = self.client.get(self.url)
        self.assertEqual(response.data['item_count'], 0)
        self.assertEqual(response.data['items'], [])

    def test_get_includes_existing_items(self):
        make_item(self.user, product_name='Tofu')
        response = self.client.get(self.url)
        self.assertEqual(response.data['item_count'], 1)
        self.assertEqual(response.data['items'][0]['product_name'], 'Tofu')

    def test_get_unknown_user_returns_404(self):
        response = self.client.get('/api/v1/list/99999/')
        self.assertEqual(response.status_code, 404)

    def test_post_valid_item_returns_201(self):
        response = self.client.post(self.url, {'product_name': 'Almond Milk', 'quantity': 2})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['product_name'], 'Almond Milk')

    def test_post_item_appears_in_list(self):
        self.client.post(self.url, {'product_name': 'Tempeh', 'quantity': 1})
        response = self.client.get(self.url)
        names = [item['product_name'] for item in response.data['items']]
        self.assertIn('Tempeh', names)

    def test_post_missing_product_name_returns_400(self):
        response = self.client.post(self.url, {'quantity': 3})
        self.assertEqual(response.status_code, 400)


# ---------------------------------------------------------------------------
# PATCH + DELETE  /api/v1/list/<user_id>/items/<item_id>/
# ---------------------------------------------------------------------------
class ListItemRUDViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        self.item = make_item(self.user, product_name='Oat Milk', quantity=1)
        self.url = f'/api/v1/list/{self.user.pk}/items/{self.item.pk}/'

    def test_patch_quantity_returns_200_with_updated_value(self):
        response = self.client.patch(self.url, {'quantity': 5}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['quantity'], 5)

    def test_patch_checked_returns_200_with_updated_value(self):
        response = self.client.patch(self.url, {'checked': True}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['checked'])

    def test_patch_unknown_item_returns_404(self):
        response = self.client.patch(f'/api/v1/list/{self.user.pk}/items/99999/', {'quantity': 1}, format='json')
        self.assertEqual(response.status_code, 404)

    def test_patch_item_belonging_to_different_user_returns_404(self):
        other_user = make_user(email='other@example.com')
        response = self.client.patch(f'/api/v1/list/{other_user.pk}/items/{self.item.pk}/', {'quantity': 1}, format='json')
        self.assertEqual(response.status_code, 404)

    def test_delete_returns_204(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, 204)

    def test_delete_unknown_item_returns_404(self):
        response = self.client.delete(f'/api/v1/list/{self.user.pk}/items/99999/')
        self.assertEqual(response.status_code, 404)
