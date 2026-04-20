import { createBrowserRouter } from 'react-router-dom'
import App from "./App"
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import About from './pages/About'
// import { verifyUser } from './utils/authUtils'

const router = createBrowserRouter([
    {
        path:"/",
        element: <App />,
        children:[
            {
                index:true,
                element:<LoginPage/>
            },
            {
                path:'homepage/',
            //    loader: verifyUser,
                element:<HomePage/>
            },
            {
                path:'about/',
                element:<About/>
            }

        ]
    }
])

export default router