import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { advancedExercises } from '../src/data/advancedExercises.js';

function createDocument() {
  const elements = new Map();
  const create = (id) => {
    let text = id === 'output' ? '0' : '';
    const element = {
      id, children: [], listeners: {},
      get textContent() { return text; },
      set textContent(value) { text = String(value); },
      addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); },
      click() { for (const callback of this.listeners.click || []) callback.call(this, { type: 'click', target: this }); },
      append(child) { this.children.push(child); this.textContent += child.textContent; },
    };
    elements.set(`#${id}`, element);
    return element;
  };
  for (const id of ['action', 'reset', 'output', 'list']) create(id);
  return {
    querySelector(selector) { return elements.get(selector) || null; },
    createElement(tag) { return { tagName: tag.toUpperCase(), textContent: '', children: [] }; },
  };
}

for (const [chapterId, exercises] of Object.entries(advancedExercises)) {
  test(`chapter ${chapterId} ships ten passing, behavior-checked model solutions`, () => {
    assert.equal(exercises.length, 10);
    for (const [index, exercise] of exercises.entries()) {
      const checks = [];
      const sandbox = {
        document: createDocument(),
        console: { log() {}, error() {} },
        __assert(label, passed, actual = passed) { checks.push({ label, passed: Boolean(passed), actual }); },
      };
      try {
        vm.runInNewContext(`${exercise.solution}\n${exercise.check || ''}`, sandbox, { timeout: 100 });
        if (exercise.manualInteraction) {
          const elements = sandbox.document;
          for (const step of exercise.manualInteraction.steps) {
            elements.querySelector(step.target).click();
            for (const check of step.checks) {
              const target = elements.querySelector(check.selector);
              const actual = check.type === 'childCount' ? target.children.length : target.textContent;
              checks.push({ label: check.selector, passed: String(actual) === String(check.equals), actual });
            }
          }
        }
      } catch (error) {
        assert.fail(`c${chapterId}-${index + 1} (${exercise.title}) threw: ${error.message}`);
      }
      assert.ok(checks.length > 0, `c${chapterId}-${index + 1} must perform a behavioral assertion`);
      assert.ok(checks.every((check) => check.passed), `c${chapterId}-${index + 1} failed: ${JSON.stringify(checks)}`);
      assert.equal(exercise.hint.length, 3, `c${chapterId}-${index + 1} needs three hints`);
      assert.ok(exercise.hint[0] !== exercise.hint[1] && exercise.hint[1] !== exercise.hint[2]);
    }
  });
}




