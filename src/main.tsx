import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import HomePage from './pages/HomePage.tsx'
import Register from './pages/Register.tsx'
import Login from './pages/Login.tsx'
import Legal from './pages/Legal.tsx'
import GitHubCallback from './pages/GitHubCallback.tsx'
import TestLogin from './pages/TestLogin.tsx'
import ItemDetailPage from './pages/ItemDetailPage.tsx'
import React from 'react'
import { AuthProvider } from './context/AuthContext'

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/login",
    element: <Login />
  }, {
    path: "/login/github-callback",
    element: <GitHubCallback />
  },
  {
    path: "/testlogin",
    element: <TestLogin />
  },
  {
    path: "/Legal",
    element: <Legal />
  },{
    path: "/item",
    element: <ItemDetailPage />
  }
]);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
)
