import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';  // react-router-dom からインポート
import HomePage from './pages/HomePage';
import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';
import GitHubCallbackPage from './pages/auth/GitHubCallbackPage';
import Legal from './pages/Legal';
import ItemDetailPage from './pages/ItemDetailPage';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import ItemFormPage from './pages/ItemFormPage';
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
    path: "/login/github-callback",
    element: <Layout><GitHubCallbackPage /></Layout>,
  },
  {
    path: "/legal",
    element: <Layout><Legal /></Layout>,
  },
  {
    path: "/item/:itemId",
    element: <Layout><ItemDetailPage /></Layout>,
  },
  {
    path: "/test/item/:itemId",
    element: <Layout><ItemDetailPage demoMode /></Layout>,
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