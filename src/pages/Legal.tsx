import React from "react";

const Legal: React.FC = () => (
	<footer
		style={{ padding: "2rem", background: "#f5f5f5", textAlign: "center" }}
	>
		<div>
			<h4>サイトの方針・ポリシー</h4>
			<p>
				ここにはサイトの方針やプライバシーポリシー、利用規約などの情報が入ります。
			</p>
			<small>
				&copy; {new Date().getFullYear()} GradWork. All rights reserved.
			</small>
		</div>
	</footer>
);

export default Legal;
