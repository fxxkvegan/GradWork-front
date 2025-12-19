import {
	Box,
	Card,
	CardContent,
	CardHeader,
	Divider,
	Paper,
	Skeleton,
	Stack,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getProductFilePreview } from "../../api/productFilesApi";

type Props = {
	productId: number | null;
	fallbackText: string;
	isDemoMode?: boolean;
};

export default function ProjectReadmeCard({
	productId,
	fallbackText,
	isDemoMode = false,
}: Props) {
	const [loading, setLoading] = useState(false);
	const [readmeText, setReadmeText] = useState<string | null>(null);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		const run = async () => {
			if (isDemoMode || !productId) {
				setReadmeText(null);
				setStatusMessage("README未登録");
				return;
			}

			setLoading(true);
			setStatusMessage(null);

			try {
				const data = await getProductFilePreview(productId, "README.md");
				if (cancelled) {
					return;
				}
				setReadmeText(data.content ?? "");
			} catch {
				if (cancelled) {
					return;
				}
				setReadmeText(null);
				setStatusMessage("README未登録");
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		void run();
		return () => {
			cancelled = true;
		};
	}, [isDemoMode, productId]);

	return (
		<Card>
			<CardHeader title="README.md" subheader="プロジェクト概要" />
			<Divider />
			<CardContent>
				<Paper variant="outlined" sx={{ p: 2 }}>
					{loading ? (
						<Stack spacing={1}>
							<Skeleton variant="text" width="50%" />
							<Skeleton variant="rectangular" height={120} />
							<Skeleton variant="rectangular" height={120} />
						</Stack>
					) : readmeText ? (
						<Box
							sx={{
								"& h1": { fontSize: "1.5rem", mt: 0, mb: 1 },
								"& h2": { fontSize: "1.25rem", mt: 2, mb: 1 },
								"& pre": {
									padding: 16,
									borderRadius: 1,
									border: "1px solid",
									borderColor: "divider",
									backgroundColor: "background.default",
									overflowX: "auto",
								},
								"& code": {
									fontFamily: "monospace",
								},
							}}
						>
							<ReactMarkdown>{readmeText}</ReactMarkdown>
						</Box>
					) : (
						<Stack spacing={1.25}>
							<Typography variant="body2" color="text.secondary">
								READMEが未登録のため概要を表示しています。
							</Typography>
							{statusMessage ? (
								<Typography variant="caption" color="text.secondary">
									{statusMessage}
								</Typography>
							) : null}
							<Typography
								variant="body1"
								sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}
							>
								{fallbackText}
							</Typography>
						</Stack>
					)}
				</Paper>
			</CardContent>
		</Card>
	);
}
