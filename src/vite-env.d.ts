/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GITHUB_CLIENT_ID: string;
    // 他の環境変数があれば追加
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
