import { STORAGE_KEYS } from '../constants/api';

export const getAuthToken = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
        sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};


export const getTokenSource = (): 'localStorage' | 'sessionStorage' | 'none' => {
    if (localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)) return 'localStorage';
    if (sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)) return 'sessionStorage';
    return 'none';
};
//とーくんほぞん
export const saveAuthToken = (token: string, remember: boolean): void => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};


// トークンをクリア
export const clearAllTokens = (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
};

//リダイレクト
export const redirectToLogin = (): void => {
    window.location.href = '/login';
};
