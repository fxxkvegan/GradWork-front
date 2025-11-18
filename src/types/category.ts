/**
 * カテゴリの型定義
 * バックエンド: Category モデル, CategoryController
 */
export interface Category {
	/** カテゴリID */
	id: number;

	/** カテゴリ名 */
	name: string;

	/** カテゴリ画像URL（完全なURL） */
	image: string | null;

	/** このカテゴリに属する商品の数 */
	products_count: number;

	/** 作成日時 */
	created_at?: string;

	/** 更新日時 */
	updated_at?: string;
}

/**
 * カテゴリ一覧レスポンスの型
 * バックエンド: CategoryController の index() メソッド
 */
export interface CategoryListResponse {
	/** カテゴリの配列 */
	items: Category[];

	/** カテゴリの総数 */
	total: number;
}

/**
 * カテゴリ作成リクエストの型
 */
export interface CreateCategoryRequest {
	/** カテゴリ名（必須） */
	name: string;

	/** カテゴリ画像ファイル（オプション） */
	image?: File;
}

/**
 * カテゴリ更新リクエストの型
 */
export interface UpdateCategoryRequest {
	/** カテゴリ名（オプション） */
	name?: string;

	/** カテゴリ画像ファイル（オプション） */
	image?: File;
}
