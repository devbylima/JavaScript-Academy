export const PROGRESS_KEY = 'js-academy-progress-v1';

export function normalizeProgress(value, totalExercises) {
  const ids = new Set((value?.done || []).filter((id) => typeof id === 'string'));
  const done = [...ids];
  return {
    done,
    xp: done.length ? Math.max(0, Number(value?.xp) || 0) : 0,
    last: typeof value?.last === 'string' ? value.last : 'c1-1',
    totalExercises,
  };
}

export function completeExercise(progress, exercise) {
  if (progress.done.includes(exercise.id)) return progress;
  return {
    ...progress,
    done: [...progress.done, exercise.id],
    xp: progress.xp + exercise.xp,
  };
}

export function chapterUnlocked(chapterId, done) {
  return chapterId === 1 || done.includes(`c${chapterId - 1}-10`);
}

export function loadProgress(storage, totalExercises) {
  try {
    return normalizeProgress(JSON.parse(storage.getItem(PROGRESS_KEY)), totalExercises);
  } catch {
    return normalizeProgress(null, totalExercises);
  }
}

export function saveProgress(storage, progress) {
  storage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

