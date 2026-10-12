import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { beginnerGuides, beginnerLessonText } from '../src/data/beginnerExercises.js';

const source = fs.readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
const samplesStart = source.indexOf('const samples = [') + 'const samples = '.length;
const samplesEnd = source.indexOf('\n];\n\nconst chapters', samplesStart) + 2;
assert.ok(samplesStart >= 'const samples = '.length && samplesEnd > samplesStart, 'beginner sample table should remain in main.jsx');
const samples = vm.runInNewContext(`(${source.slice(samplesStart, samplesEnd)})`);

test('chapters 1–6 have ten authored tasks with compilable partial starters and solutions', () => {
  assert.equal(samples.length, 10);
  for (let chapter = 1; chapter <= 6; chapter += 1) {
    const guides = beginnerGuides[chapter];
    assert.equal(guides.length, 10, `chapter ${chapter}`);
    assert.ok(beginnerLessonText[chapter].length > 50);
    for (let index = 0; index < 10; index += 1) {
      const [description, nudge, concept, gap, replacement, explanation] = guides[index];
      const [solution] = samples[chapter - 1][index];
      const task = `c${chapter}-${index + 1}`;
      assert.ok(description.length > 20, `${task} needs a concrete task`);
      assert.ok(nudge.length > 25 && concept.length > 25, `${task} needs two useful hints`);
      assert.ok(explanation.length > 30, `${task} needs an explained model solution`);
      assert.ok(solution.includes(gap), `${task} gap must exist in its model solution`);
      assert.ok(replacement.includes('TODO'), `${task} starter must contain an actionable gap`);
      const starter = solution.replace(gap, replacement);
      assert.notEqual(starter, solution, `${task} starter must be incomplete`);
      assert.doesNotThrow(() => new vm.Script(starter), `${task} starter must remain editable JavaScript`);
    }
  }
});
