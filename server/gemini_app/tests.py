from unittest.mock import patch, MagicMock
from django.test import TestCase
from rest_framework.test import APIClient

from kroger_app.models import CachedProduct
from gemini_app.gemini_utils import GeminiAPIError


def make_product(upc='0001111042058', is_vegan=None, vegan_checked=False):
    return CachedProduct.objects.create(
        upc=upc,
        name='Oat Milk',
        brand='Oatly',
        categories='Dairy Alternatives',
        description='Non-dairy oat-based milk',
        vegan_checked=vegan_checked,
        is_vegan=is_vegan,
    )


class VeganCheckViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def url(self, upc):
        return f'/api/v1/gemini/vegan/{upc}/'

    def test_unknown_upc_returns_404(self):
        response = self.client.get(self.url('0000000000000'))
        self.assertEqual(response.status_code, 404)

    def test_returns_cached_result_without_calling_gemini(self):
        product = make_product(is_vegan=True, vegan_checked=True)
        with patch('gemini_app.views.check_vegan_by_upc', return_value=(product, True)) as mock_fn:
            response = self.client.get(self.url(product.upc))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['cached'])
        self.assertEqual(response.data['vegan_status'], 'vegan')
        mock_fn.assert_called_once_with(product.upc)

    def test_unchecked_product_calls_gemini_returns_vegan(self):
        product = make_product()
        product.is_vegan = True
        product.vegan_checked = True
        with patch('gemini_app.views.check_vegan_by_upc', return_value=(product, False)) as mock_fn:
            response = self.client.get(self.url(product.upc))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['cached'])
        self.assertTrue(response.data['is_vegan'])
        self.assertEqual(response.data['vegan_status'], 'vegan')
        mock_fn.assert_called_once_with(product.upc)

    def test_unchecked_product_calls_gemini_returns_not_vegan(self):
        product = make_product()
        product.is_vegan = False
        product.vegan_checked = True
        with patch('gemini_app.views.check_vegan_by_upc', return_value=(product, False)) as mock_fn:
            response = self.client.get(self.url(product.upc))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['cached'])
        self.assertFalse(response.data['is_vegan'])
        self.assertEqual(response.data['vegan_status'], 'not_vegan')

    def test_gemini_api_error_returns_502(self):
        product = make_product()
        with patch('gemini_app.views.check_vegan_by_upc', side_effect=GeminiAPIError('timeout')):
            response = self.client.get(self.url(product.upc))
        self.assertEqual(response.status_code, 502)
