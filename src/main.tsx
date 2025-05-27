import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router'
import HomePage from './pages/HomePage.tsx'
import Register from './pages/Register.tsx'
import Login from './pages/Login.tsx'
import Welcome from './pages/welcome.tsx'
import Legal from './pages/Legal.tsx'
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/home",
    element: <HomePage />,
  },

  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/welcome",
    element: <Welcome />
  },
  {
    path: "/Legal",
    element: <Legal />
  }

]);

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)
