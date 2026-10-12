import test from 'node:test';
import assert from 'node:assert/strict';
import { chapterUnlocked, completeExercise, loadProgress, normalizeProgress, PROGRESS_KEY, saveProgress } from '../src/core/progress.js';
import { gradeRun } from '../src/core/grading.js';

test('output grading accepts the result and rejects a different result', () => {
  assert.equal(gradeRun({ logs: ['5'], expectedOutput: '5' }).passed, true);
  assert.equal(gradeRun({ logs: ['4'], expectedOutput: '5' }).passed, false);
});

test('behavior checks grade object, method, array, and DOM results without source comparison', () => {
  const checks = [
    { label: 'Property', passed: true, actual: 'true' },
    { label: 'Methode', passed: true, actual: '12' },
    { label: 'Array', passed: true, actual: 'Buch, Stift' },
    { label: 'Button', passed: true, actual: '2 Klicks' },
  ];
  assert.equal(gradeRun({ checks }).passed, true);
  assert.equal(gradeRun({ checks: [{ ...checks[2], passed: false }] }).passed, false);
});

test('progress normalizes corrupt and duplicate records and unlocks by completion', () => {
  const state = normalizeProgress({ done: ['c1-10', 'c1-10'], xp: 50, last: 'c2-1' }, 100);
  assert.deepEqual(state.done, ['c1-10']);
  assert.equal(chapterUnlocked(2, state.done), true);
  assert.equal(chapterUnlocked(3, state.done), false);
});

test('XP is awarded exactly once and progress round-trips through storage', () => {
  const exercise = { id: 'c1-1', xp: 10 };
  const once = completeExercise({ done: [], xp: 0 }, exercise);
  assert.equal(completeExercise(once, exercise), once);
  const data = new Map();
  const storage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  saveProgress(storage, once);
  assert.deepEqual(loadProgress(storage, 100).done, ['c1-1']);
  assert.equal(data.has(PROGRESS_KEY), true);
});


