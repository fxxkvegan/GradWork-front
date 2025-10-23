import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import HomePage from './pages/HomePage.tsx'
import Register from './pages/Register.tsx'
import Login from './pages/Login.tsx'
import Legal from './pages/Legal.tsx'
import GitHubCallback from './pages/GitHubCallback.tsx'
import TestLogin from './pages/TestLogin.tsx'
import ItemDemoPage from './pages/ItemDemoPage'
import ItemDetailPage from './pages/ItemDetailPage'
import React from 'react'
import { AuthProvider } from './context/AuthContext'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout><HomePage /></Layout>,
  },
  {
    path: "/home",
    element: <Layout><HomePage /></Layout>,
  },
  {
    path: "/register",
    element: <Layout><RegisterPage /></Layout>,
  },
  {
    path: "/login",
    element: <Layout><LoginPage /></Layout>,
  },
  {
    path: "/Legal",
    element: <Legal />
  },
  {
    path: "/item",
    element: <ItemDemoPage />
  },
  {
    path: "/item/:id",
    element: <ItemDetailPage />
  },
  {
    path: "/create",
    element: <Layout><ItemFormPage /></Layout>,
  },
  {
    path: "/edit/:itemId",
    element: <Layout><ItemFormPage /></Layout>,
  },
  {
    path: "*",
    element: <Layout><div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>404 - ページが見つかりません</h1>
      <p>お探しのページは存在しません。</p>
      <a href="/">ホームに戻る</a>
    </div></Layout>,
  },
]);

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);