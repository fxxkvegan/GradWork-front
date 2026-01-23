import { Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

interface ProductTaglineProps {
	tagline?: string | null;
	placeholder?: string;
	lines?: number;
	className?: string;
	sx?: SxProps<Theme>;
}

const ProductTagline = ({
	tagline,
	placeholder = "（説明未設定）",
	lines,
	className,
	sx,
}: ProductTaglineProps) => {
	const resolvedTagline = typeof tagline === "string" ? tagline.trim() : "";
	const displayText = resolvedTagline !== "" ? resolvedTagline : placeholder;
	const isPlaceholder = displayText === placeholder;
	const clampStyles =
		lines && lines > 0
			? {
					display: "-webkit-box",
					WebkitLineClamp: lines,
					WebkitBoxOrient: "vertical",
					overflow: "hidden",
					minHeight: `${lines * 1.3}em`,
				}
			: undefined;
	const baseSx: SxProps<Theme> = {
		fontStyle: isPlaceholder ? "italic" : "normal",
		...(clampStyles ?? {}),
	};
	const extraSx = Array.isArray(sx) ? sx : [sx];

	return (
		<Typography
			variant="body2"
			className={className}
			color={isPlaceholder ? "text.disabled" : "text.secondary"}
			sx={[baseSx, ...extraSx]}
		>
			{displayText}
		</Typography>
	);
};

export default ProductTagline;
