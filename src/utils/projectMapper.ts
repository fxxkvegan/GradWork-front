import type { RankingItemResponse } from "../services/productApi";
import type { HomeProject, HomeProjectOwner } from "../types/home";

const FALLBACK_IMAGE = "/no-image.png";

const sanitizeString = (value: unknown): string | null => {
	return typeof value === "string" && value.trim() !== "" ? value : null;
};

export const parseImageField = (value: unknown): string[] => {
	if (Array.isArray(value)) {
		return value
			.filter((item): item is string => typeof item === "string")
			.map((item) => item.trim())
			.filter((item) => item !== "");
	}

	if (typeof value === "string") {
		try {
			const parsed = JSON.parse(value);
			return parseImageField(parsed);
		} catch {
			return value.trim() !== "" ? [value] : [];
		}
	}

	return [];
};

const normalizeOwner = (
	owner: RankingItemResponse["owner"],
): HomeProjectOwner | null => {
	if (!owner) {
		return null;
	}

	return {
		id: Number(owner.id) || 0,
		name: owner.name ?? "",
		displayName: owner.displayName ?? null,
		avatarUrl: owner.avatarUrl ?? null,
	};
};

export const mapRankingItemToProject = (
	item: RankingItemResponse,
): HomeProject => {
	const rawImages = item?.image_urls ?? item?.image_url;
	const imageUrls = parseImageField(rawImages ?? []);
	const categoryNames = Array.isArray(item?.categories)
		? item.categories
				.map((category) => sanitizeString(category?.name))
				.filter((name): name is string => Boolean(name))
		: [];
	const explicitTags = Array.isArray(item?.tags)
		? item.tags.filter(
				(tag): tag is string => typeof tag === "string" && tag.trim() !== "",
			)
		: [];
	const tags = Array.from(new Set([...categoryNames, ...explicitTags])).slice(
		0,
		6,
	);
	const firstCategory = categoryNames[0] ?? "カテゴリー";

	return {
		id: Number(item?.id) || 0,
		title: item?.name ?? "無題",
		subtitle: item?.description ?? "",
		img: imageUrls[0] ?? FALLBACK_IMAGE,
		category: firstCategory,
		rating:
			typeof item?.rating === "number"
				? item.rating
				: Number((item?.rating as unknown) ?? 0) || 0,
		downloads:
			typeof item?.download_count === "number"
				? item.download_count
				: Number((item?.download_count as unknown) ?? 0) || 0,
		tags: tags.length ? tags : [firstCategory],
		owner: normalizeOwner(item?.owner),
	};
};
