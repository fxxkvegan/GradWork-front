// お気に入りの操作を管理するユーティリティ

// ローカルストレージのキー
const FAVORITES_KEY = "favorites";

/**
 * お気に入りの一覧を取得
 */
export const getFavorites = (): number[] => {
	try {
		const savedFavorites = localStorage.getItem(FAVORITES_KEY);
		return savedFavorites ? JSON.parse(savedFavorites) : [];
	} catch (error) {
		console.error("Failed to get favorites:", error);
		return [];
	}
};

/**
 * 特定のアイテムがお気に入りかどうかをチェック
 */
export const isFavorite = (id: number): boolean => {
	const favorites = getFavorites();
	return favorites.includes(id);
};

/**
 * お気に入りの追加
 */
export const addFavorite = (id: number): void => {
	try {
		const favorites = getFavorites();
		if (!favorites.includes(id)) {
			favorites.push(id);
			localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
		}
	} catch (error) {
		console.error("Failed to add favorite:", error);
	}
};

/**
 * お気に入りの削除
 */
export const removeFavorite = (id: number): void => {
	try {
		const favorites = getFavorites();
		const newFavorites = favorites.filter((favoriteId) => favoriteId !== id);
		localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
	} catch (error) {
		console.error("Failed to remove favorite:", error);
	}
};

/**
 * お気に入りの切り替え
 */
export const toggleFavorite = (id: number): boolean => {
	const wasFavorite = isFavorite(id);
	if (wasFavorite) {
		removeFavorite(id);
	} else {
		addFavorite(id);
	}
	return !wasFavorite;
};
