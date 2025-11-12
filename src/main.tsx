import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import HomePage from './pages/HomePage.tsx'
import RegisterPage from './pages/auth/RegisterPage.tsx'
import LoginPage from './pages/auth/LoginPage.tsx'
import GitHubCallbackPage from './pages/auth/GitHubCallbackPage.tsx'
import Legal from './pages/Legal.tsx'
import ItemDetailPage from './pages/ItemDetailPage.tsx'
import Layout from './components/Layout.tsx'
import { AuthProvider } from './context/AuthContext'
import ProjectList from './pages/ProjectList.tsx'
import AddItemsPage from './pages/admin/AddItemsPage.tsx'

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
    path: "/projects",
    element: <Layout><ProjectList /></Layout>
  },
  {
    path: "/register",
    element: <Layout><RegisterPage /></Layout>
  },
  {
    path: "/login",
    element: <Layout><LoginPage /></Layout>
  },
  {
    path: "/login/github-callback",
    element: <Layout><GitHubCallbackPage /></Layout>
  },
  {
    path: "/legal",
    element: <Layout><Legal /></Layout>
  },
  {
    path: "/item/:itemId",
    element: <Layout><ItemDetailPage /></Layout>
  },
  {
    path: "/local/item/:itemId",
    element: <Layout><ItemDetailPage /></Layout>
  },
  {
    path: "/admin/add-items",
    element: <Layout><AddItemsPage /></Layout>
  }
]);

createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
  // </React.StrictMode>
)
