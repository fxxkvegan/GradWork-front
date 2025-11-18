import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import AddItemsPage from "./pages/admin/AddItemsPage";
import GitHubCallbackPage from "./pages/auth/GitHubCallbackPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import HomePage from "./pages/HomePage";
import ItemDemoPage from "./pages/ItemDemoPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import ItemFormPage from "./pages/ItemFormPage";
import Legal from "./pages/Legal";
import MyProductsPage from "./pages/MyProductsPage";
import ProjectList from "./pages/ProjectList";

const NotFoundPage = () => (
	<div style={{ padding: "2rem", textAlign: "center" }}>
		<h1>404 - ページが見つかりません</h1>
		<p>お探しのページは存在しません。</p>
		<a href="/">ホームに戻る</a>
	</div>
);

const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{ index: true, element: <HomePage /> },
			{ path: "home", element: <HomePage /> },
			{ path: "projects", element: <ProjectList /> },
			{ path: "register", element: <RegisterPage /> },
			{ path: "login", element: <LoginPage /> },
			{ path: "login/github-callback", element: <GitHubCallbackPage /> },
			{ path: "Legal", element: <Legal /> },
			{ path: "item", element: <ItemDemoPage /> },
			{ path: "item/:itemId", element: <ItemDetailPage /> },
			{ path: "local/item/:itemId", element: <ItemDetailPage /> },
			{ path: "admin/add-items", element: <AddItemsPage /> },
			{ path: "create", element: <ItemFormPage /> },
			{ path: "my-products", element: <MyProductsPage /> },
			{ path: "edit/:itemId", element: <ItemFormPage /> },
			{ path: "*", element: <NotFoundPage /> },
		],
	},
]);

createRoot(document.getElementById("root")!).render(
	<AuthProvider>
		<RouterProvider router={router} />
	</AuthProvider>,
);
