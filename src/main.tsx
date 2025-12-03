import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import AddItemsPage from "./pages/admin/AddItemsPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import HomePage from "./pages/HomePage";
import ItemDetailPage from "./pages/ItemDetailPage";
import ItemFormPage from "./pages/ItemFormPage";
import ItemListPage from "./pages/ItemListPage";
import Legal from "./pages/Legal";
import MyProductsPage from "./pages/MyProductsPage";
import NoticePage from "./pages/NoticePage";
import ProjectList from "./pages/ProjectList";
import SettingsPage from "./pages/SettingsPage";

const NotFoundPage = () => (
	<div style={{ padding: "2rem", textAlign: "center" }}>
		<h1>404 - ページが見つかりません</h1>
		<p>お探しのページは存在しません。</p>
		<a href="/">ホームに戻る</a>
	</div>
);

const RootLayout = () => (
	<AuthProvider>
		<NotificationProvider>
			<Layout />
		</NotificationProvider>
	</AuthProvider>
);

const router = createBrowserRouter([
	{
		path: "/",
		element: <RootLayout />,
		children: [
			{ index: true, element: <HomePage /> },
			{ path: "home", element: <HomePage /> },
			{ path: "projects", element: <ProjectList /> },
			{ path: "register", element: <RegisterPage /> },
			{ path: "login", element: <LoginPage /> },
			{ path: "Legal", element: <Legal /> },
			{ path: "item", element: <ItemListPage /> },
			{ path: "item/:itemId", element: <ItemDetailPage /> },
			{ path: "local/item/:itemId", element: <ItemDetailPage /> },
			{ path: "admin/add-items", element: <AddItemsPage /> },
			{ path: "create", element: <ItemFormPage /> },
			{ path: "my-products", element: <MyProductsPage /> },
			{ path: "settings", element: <SettingsPage /> },
			{ path: "edit/:itemId", element: <ItemFormPage /> },
			{ path: "notifications", element: <NoticePage /> },
			{ path: "*", element: <NotFoundPage /> },
		],
	},
]);

createRoot(document.getElementById("root")!).render(
	<RouterProvider router={router} />,
);
