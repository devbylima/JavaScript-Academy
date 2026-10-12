import test from 'node:test';
import assert from 'node:assert/strict';
import { readTheme, saveTheme, THEME_KEY } from '../src/core/theme.js';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

test('theme preference restores valid modes and defaults invalid or missing values to light', () => {
  assert.equal(readTheme(memoryStorage({ [THEME_KEY]: 'dark' })), 'dark');
  assert.equal(readTheme(memoryStorage({ [THEME_KEY]: 'light' })), 'light');
  assert.equal(readTheme(memoryStorage({ [THEME_KEY]: 'system' })), 'light');
  assert.equal(readTheme(memoryStorage()), 'light');
});

test('theme preference is stored under its own key without changing learning data', () => {
  const storage = memoryStorage({ 'javascript-academy-progress': '{"xp":50}' });
  saveTheme('dark', storage);
  assert.equal(readTheme(storage), 'dark');
  assert.equal(storage.getItem('javascript-academy-progress'), '{"xp":50}');
  saveTheme('invalid', storage);
  assert.equal(readTheme(storage), 'light');
});

test('theme storage failures fall back without throwing', () => {
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.equal(readTheme(blocked), 'light');
  assert.doesNotThrow(() => saveTheme('dark', blocked));
});
