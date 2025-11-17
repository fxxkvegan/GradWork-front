import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "./components/Layout.tsx";
import { AuthProvider } from "./context/AuthContext";
import AddItemsPage from "./pages/admin/AddItemsPage.tsx";
import GitHubCallbackPage from "./pages/auth/GitHubCallbackPage.tsx";
import LoginPage from "./pages/auth/LoginPage.tsx";
import RegisterPage from "./pages/auth/RegisterPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import ItemDemoPage from "./pages/ItemDemoPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import ItemFormPage from "./pages/ItemFormPage.tsx";
import Legal from "./pages/Legal.tsx";
import MyProductsPage from "./pages/MyProductsPage";
import ProjectList from "./pages/ProjectList.tsx";

const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<Layout>
				<HomePage />
			</Layout>
		),
	},
	{
		path: "/home",
		element: (
			<Layout>
				<HomePage />
			</Layout>
		),
	},
	{
		path: "/projects",
		element: (
			<Layout>
				<ProjectList />
			</Layout>
		),
	},
	{
		path: "/register",
		element: (
			<Layout>
				<RegisterPage />
			</Layout>
		),
	},
	{
		path: "/login",
		element: (
			<Layout>
				<LoginPage />
			</Layout>
		),
	},
	{
		path: "/login/github-callback",
		element: (
			<Layout>
				<GitHubCallbackPage />
			</Layout>
		),
	},
	{
		path: "/Legal",
		element: <Legal />,
	},
	{
		path: "/item",
		element: <ItemDemoPage />,
	},
	{
		path: "/item/:itemId",
		element: <ItemDetailPage />,
	},
	{
		path: "/local/item/:itemId",
		element: (
			<Layout>
				<ItemDetailPage />
			</Layout>
		),
	},
	{
		path: "/admin/add-items",
		element: (
			<Layout>
				<AddItemsPage />
			</Layout>
		),
	},
	{
		path: "/create",
		element: (
			<Layout>
				<ItemFormPage />
			</Layout>
		),
	},
	{
		path: "/my-products",
		element: (
			<Layout>
				<MyProductsPage />
			</Layout>
		),
	},
	{
		path: "/edit/:itemId",
		element: (
			<Layout>
				<ItemFormPage />
			</Layout>
		),
	},
	{
		path: "*",
		element: (
			<Layout>
				<div style={{ padding: "2rem", textAlign: "center" }}>
					<h1>404 - ページが見つかりません</h1>
					<p>お探しのページは存在しません。</p>
					<a href="/">ホームに戻る</a>
				</div>
			</Layout>
		),
	},
]);

createRoot(document.getElementById("root")!).render(
	<AuthProvider>
		<RouterProvider router={router} />
	</AuthProvider>,
);
