import axios from 'axios';

// Production URL (uncomment for production deployment)
// const krogerAPI = axios.create({
//   baseURL: 'https://aisleearthlings.com/api/v1/kroger',
//   withCredentials: true,
//   headers: { 'Content-Type': 'application/json' },
// })

// Development URL (uncomment for local development)

const krogerAPI = axios.create({
  baseURL: '/api/v1/kroger',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Returns up to 6 nearest Kroger stores for a given zip code.
export const getStoresByZip = (zipCode) =>
  krogerAPI.post(`/stores/by-zip/`, { zip_code: zipCode });

// Returns a single cached store by location_id.
export const getStoreDetail = (locationId) =>
  krogerAPI.get(`/stores/${locationId}/`);
// Returns up to 30 vegan-tagged products for a given store.
export const getProductsByLocation = (locationId) =>
  krogerAPI.post(`/search/products/`, { location_id: locationId });

// Returns up to 30 products matching the search term at the given store.
export const searchProducts = (locationId, searchTerm) =>
  krogerAPI.post(`/search/products/by-term/`, {
    location_id: locationId,
    search_term: searchTerm,
  });

// Returns full product details and store-specific price for a single product.
export const getProductDetail = (locationId, upc) =>
  krogerAPI.post(`/products/detail/`, {
    location_id: locationId,
    upc,
  });
