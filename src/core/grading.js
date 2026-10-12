export function normalizeOutput(lines) {
  return lines.map((line) => String(line)).join('\n').trim();
}

export function gradeRun({ logs = [], checks = [], error = null, expectedOutput }) {
  if (error) return { passed: false, status: 'error', actual: error };
  if (checks.length) {
    const failed = checks.filter((check) => !check.passed);
    return {
      passed: failed.length === 0,
      status: failed.length ? 'incorrect' : 'success',
      actual: checks.map((check) => `${check.label}: ${check.actual}`).join('\n'),
      checks,
    };
  }
  const actual = normalizeOutput(logs);
  const passed = actual === normalizeOutput([expectedOutput ?? '']);
  return { passed, status: passed ? 'success' : 'incorrect', actual };
}

