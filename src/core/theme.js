export const THEME_KEY = 'javascript-academy-theme';

export function readTheme(storage = globalThis.localStorage) {
  try {
    const saved = storage?.getItem(THEME_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  } catch { return 'dark'; }
}

export function saveTheme(theme, storage = globalThis.localStorage) {
  try { storage?.setItem(THEME_KEY, theme === 'dark' ? 'dark' : 'light'); }
  catch { /* The app still works when browser storage is unavailable. */ }
}


