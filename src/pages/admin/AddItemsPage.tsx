import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../../constants/api";

const AddItemsPage = () => {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [categoryInput, setCategoryInput] = useState("");
	const [imageInput, setImageInput] = useState("{}");
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSubmitting(true);
		const payload = {
			name: name.trim(),
			description: description.trim(),
			category_ids: categoryInput
				.split(",")
				.map((value) => value.trim())
				.filter(Boolean),
			image_url: imageInput.trim() || "{}",
		};
		const token =
			localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
		await fetch(`${API_CONFIG.BASE_URL}/api/products`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			body: JSON.stringify(payload),
		});
		setName("");
		setDescription("");
		setCategoryInput("");
		setImageInput("{}");
		setSubmitting(false);
	};

	return (
		<div>
			<button type="button" onClick={() => navigate(-1)}>
				← 戻る
			</button>
			<h1>アイテム追加</h1>
			<form onSubmit={handleSubmit}>
				<label>
					<span>name</span>
					<input
						value={name}
						onChange={(event) => setName(event.target.value)}
						required
					/>
				</label>
				<label>
					<span>description</span>
					<textarea
						value={description}
						onChange={(event) => setDescription(event.target.value)}
					/>
				</label>
				<label>
					<span>categoryIds</span>
					<input
						value={categoryInput}
						onChange={(event) => setCategoryInput(event.target.value)}
					/>
				</label>
				<label>
					<span>image_url</span>
					<textarea
						value={imageInput}
						onChange={(event) => setImageInput(event.target.value)}
					/>
				</label>
				<button type="submit" disabled={submitting}>
					{submitting ? "送信中..." : "追加する"}
				</button>
			</form>
		</div>
	);
};

export default AddItemsPage;
