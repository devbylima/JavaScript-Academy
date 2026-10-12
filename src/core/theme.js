export const THEME_KEY = 'javascript-academy-theme';

export function readTheme(storage = globalThis.localStorage) {
  try { return storage?.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
}

export function saveTheme(theme, storage = globalThis.localStorage) {
  try { storage?.setItem(THEME_KEY, theme === 'dark' ? 'dark' : 'light'); }
  catch { /* The app still works when browser storage is unavailable. */ }
}
