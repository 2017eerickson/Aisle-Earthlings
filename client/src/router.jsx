import { createBrowserRouter } from 'react-router-dom'
import App from "./App"
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import About from './pages/About'
import ComparePage from './pages/ComparePage'
import FavoritesPage from './pages/FavoritesPage'
import StorePage from './pages/StorePage'
import ProductPage from './pages/ProductPage'
const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <LoginPage />
            },
            {
                path: 'homepage/',
                element: <HomePage />
            },
            {
                path: 'about/',
                element: <About />
            },
            {
                path: 'compare/',
                element: <ComparePage />
            },
            {
                path: 'favorites/',
                element: <FavoritesPage />
            },
            {
                path: 'store/:location_id/',
                element: <StorePage />
            },
            {
                path: 'product/:upc/',
                element: <ProductPage />
            },
        ]
    }
])

export default router
