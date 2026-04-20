import { createBrowserRouter } from 'react-router-dom'
import App from "./App"
import HomePage from './pages/HomePage'
import SideNav from './components/sideNav'
import LoginPage from './pages/LoginPage'

const router = createBrowserRouter([
    {
        path:"/",
        // loader: getAllItems,
        element: <App />,
        children:[
            {
                index:true,
                element:<LoginPage/>
            },
            {
                path:'sideNav/',
                element:<SideNav/>
            },
            {
                path:'homepage/',
                element:<HomePage/>
            },

           
           

        ]
    }
])

export default router