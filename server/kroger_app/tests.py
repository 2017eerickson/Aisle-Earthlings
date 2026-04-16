from django.test import TestCase
from rest_framework.test import APIClient
from unittest.mock import patch

from .models import CachedStore
from .kroger_app_utils import KrogerAPIError

STORES_URL = '/api/v1/kroger/stores/by-zip/'
SEARCH_URL = '/api/v1/kroger/search/products/'
DETAIL_URL = '/api/v1/kroger/products/detail/'

SAMPLE_STORE_DATA = {
    'location_id': '01400376',
    'name': 'Kroger',
    'store_number': '632',
    'address_line': '1234 Main St',
    'city': 'Frederick',
    'state': 'MD',
    'zip_code': '21701',
}

SAMPLE_PRODUCT = {
    'upc': '0001111042058',
    'name': 'Vegan Butter',
    'brand': 'Earth Balance',
    'categories': 'Dairy',
    'description': 'Vegan Butter',
    'image_front': 'https://example.com/img.jpg',
    'image_back': '',
    'image_left': '',
    'image_right': '',
    'vegan_status': 'unchecked',
    'is_vegan': None,
    'vegan_checked': False,
    'price': '4.99',
    'price_per_unit': '$0.31/oz',
    'size': '16 oz',
    'sold_by': 'UNIT',
    'in_stock': True,
    'location_id': '01400376',
}


# ---------------------------------------------------------------------------
# POST /api/v1/kroger/stores/by-zip/
# ---------------------------------------------------------------------------
class StoresByZipTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.store = CachedStore.objects.create(**SAMPLE_STORE_DATA)

    def test_missing_zip_code_returns_400(self):
        response = self.client.post(STORES_URL, {})
        self.assertEqual(response.status_code, 400)

    @patch('kroger_app.views.get_locations_by_zip', side_effect=ValueError('bad zip'))
    def test_invalid_zip_code_returns_400(self, _):
        response = self.client.post(STORES_URL, {'zip_code': 'abc'})
        self.assertEqual(response.status_code, 400)

    @patch('kroger_app.views.get_locations_by_zip')
    def test_valid_zip_returns_200_with_stores(self, mock_fn):
        mock_fn.return_value = [self.store]
        response = self.client.post(STORES_URL, {'zip_code': '21701'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['location_id'], '01400376')

    @patch('kroger_app.views.get_locations_by_zip')
    def test_valid_zip_no_stores_returns_200_empty_list(self, mock_fn):
        mock_fn.return_value = []
        response = self.client.post(STORES_URL, {'zip_code': '00000'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    @patch('kroger_app.views.get_locations_by_zip', side_effect=KrogerAPIError('api down'))
    def test_kroger_api_error_returns_502(self, _):
        response = self.client.post(STORES_URL, {'zip_code': '21701'})
        self.assertEqual(response.status_code, 502)


# ---------------------------------------------------------------------------
# POST /api/v1/kroger/search/products/
# ---------------------------------------------------------------------------
class KrogerProductSearchTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_missing_location_id_returns_400(self):
        response = self.client.post(SEARCH_URL, {})
        self.assertEqual(response.status_code, 400)

    @patch('kroger_app.views.get_vegan_products_for_location', side_effect=CachedStore.DoesNotExist)
    def test_unknown_store_returns_404(self, _):
        response = self.client.post(SEARCH_URL, {'location_id': '99999999'})
        self.assertEqual(response.status_code, 404)

    @patch('kroger_app.views.get_vegan_products_for_location')
    def test_valid_location_returns_200_with_products(self, mock_fn):
        mock_fn.return_value = [SAMPLE_PRODUCT]
        response = self.client.post(SEARCH_URL, {'location_id': '01400376'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['upc'], '0001111042058')

    @patch('kroger_app.views.get_vegan_products_for_location')
    def test_valid_location_returns_200_empty_list(self, mock_fn):
        mock_fn.return_value = []
        response = self.client.post(SEARCH_URL, {'location_id': '01400376'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    @patch('kroger_app.views.get_vegan_products_for_location', side_effect=KrogerAPIError('api down'))
    def test_kroger_api_error_returns_502(self, _):
        response = self.client.post(SEARCH_URL, {'location_id': '01400376'})
        self.assertEqual(response.status_code, 502)


# ---------------------------------------------------------------------------
# POST /api/v1/kroger/products/detail/
# ---------------------------------------------------------------------------
class ProductDetailByLocationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_missing_upc_returns_400(self):
        response = self.client.post(DETAIL_URL, {'location_id': '01400376'})
        self.assertEqual(response.status_code, 400)

    def test_missing_location_id_returns_400(self):
        response = self.client.post(DETAIL_URL, {'upc': '0001111042058'})
        self.assertEqual(response.status_code, 400)

    @patch('kroger_app.views.get_product_details', side_effect=CachedStore.DoesNotExist)
    def test_unknown_store_returns_404(self, _):
        response = self.client.post(DETAIL_URL, {'location_id': '99999999', 'upc': '0001111042058'})
        self.assertEqual(response.status_code, 404)

    @patch('kroger_app.views.get_product_details')
    def test_valid_request_returns_200_with_product(self, mock_fn):
        mock_fn.return_value = SAMPLE_PRODUCT
        response = self.client.post(DETAIL_URL, {'location_id': '01400376', 'upc': '0001111042058'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['upc'], '0001111042058')
        self.assertEqual(response.data['name'], 'Vegan Butter')

    @patch('kroger_app.views.get_product_details', side_effect=KrogerAPIError('api down'))
    def test_kroger_api_error_returns_502(self, _):
        response = self.client.post(DETAIL_URL, {'location_id': '01400376', 'upc': '0001111042058'})
        self.assertEqual(response.status_code, 502)
