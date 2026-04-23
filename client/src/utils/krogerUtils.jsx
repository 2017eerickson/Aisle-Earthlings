import axios from 'axios';

const BASE_URL = 'https://aisleearthlings.com/api/v1/kroger';

// Returns up to 6 nearest Kroger stores for a given zip code.
export const getStoresByZip = (zipCode) =>
  axios.post(`${BASE_URL}/stores/by-zip/`, { zip_code: zipCode });

// Returns a single cached store by location_id.
export const getStoreDetail = (locationId) =>
  axios.get(`${BASE_URL}/stores/${locationId}/`);

// Returns up to 30 vegan-tagged products for a given store.
export const getProductsByLocation = (locationId) =>
  axios.post(`${BASE_URL}/search/products/`, { location_id: locationId });

// Returns up to 30 products matching the search term at the given store.
export const searchProducts = (locationId, searchTerm) =>
  axios.post(`${BASE_URL}/search/products/by-term/`, {
    location_id: locationId,
    search_term: searchTerm,
  });

// Returns full product details and store-specific price for a single product.
export const getProductDetail = (locationId, upc) =>
  axios.post(`${BASE_URL}/products/detail/`, {
    location_id: locationId,
    upc,
  });
