# JavaScript Academy

A German-language browser app for practicing JavaScript in short exercises.

## Start locally

```sh
pnpm install
pnpm dev
```

Create a production build with `pnpm build` and run the automated checks with `pnpm test` (Node's built-in test runner).

## Learning app

- Ten chapters with ten exercises each. Chapters 7–10 have incomplete starter code, ordered difficulty, concrete three-stage hints, explanatory solutions, and behavior-based checks.
- CodeMirror provides editable JavaScript with syntax highlighting, line numbers, folding, and active-line highlighting.
- The Light/Dark preference is stored separately from learner progress. CodeMirror switches to its One Dark theme in Dark Mode, and the document applies the saved theme before the app renders.
- Responsive layout keeps chapter navigation fixed and scrolls the chapter list only if its contents exceed the available height. The main learning content scrolls independently.
- Exercises can be repeated. Chapters unlock after finishing the previous chapter; progress and once-only XP are stored in localStorage. “Von vorn beginnen” changes the selected exercise without erasing progress.
- DOM exercises show a live, sandboxed preview. Hidden behavior checks use a separate iframe that runs the same learner source with appended assertions, so test actions do not replace or consume the visible preview.
- Automated tests cover output grading, object and method behavior, array mutations, DOM events, exercise model solutions, and progress persistence.

## Runner limits

Learner source executes in an iframe with `sandbox="allow-scripts"` and no same-origin permission. A Content Security Policy disables network connections and external resources. The hidden test iframe is removed after completion or a 1.5 second parent-side timeout; the visible preview has its own watchdog and is reset if execution never completes. Message events are accepted only from the expected iframe window and run identifier.

This reduces access to the parent app but does not make arbitrary JavaScript safe against every attack. Browser vulnerabilities, resource exhaustion, timing differences, and asynchronous work after the synchronous completion signal remain limitations. Do not use this browser runner as a production service for hostile code; that requires stronger process or server-side isolation.

## Verification status

Verified with pnpm 11.25.0 and Node 24.19.0: `pnpm install --frozen-lockfile`, `pnpm build` (Vite 8.3.4), and `pnpm test` (12 passing tests). The production build reports a large JavaScript chunk warning and lucide-react module directive notices. Browser spot checks cover theme switching and persistence, CodeMirror mode, and the responsive viewport sizes documented in the pull request.
