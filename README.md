# JavaScript Academy

A German-language browser app for practicing JavaScript in short exercises.

## Start locally

```sh
pnpm install
pnpm dev
```

Create a production build with `pnpm build` and run the automated checks with `pnpm test` (Node's built-in test runner).

## Deploy to GitHub Pages

The Vite base path is configured for this repository at `/JavaScript-Academy/`. The `Build and deploy to GitHub Pages` workflow runs the locked pnpm install, tests, and production build on pull requests targeting `main`; after merge it deploys `dist` from `main`. It can also be started manually from `main` with `workflow_dispatch`.

After merging, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**. The first successful workflow deployment publishes the app at `https://devbylima.github.io/JavaScript-Academy/`. The app uses hash-based language navigation (`#` and `#sql`), so refreshing either route returns to the same learning path.

## Learning app

- Ten chapters with ten exercises each. Chapters 7–10 have incomplete starter code, ordered difficulty, concrete three-stage hints, explanatory solutions, and behavior-based checks.
- CodeMirror provides editable JavaScript with syntax highlighting, line numbers, folding, and active-line highlighting.
- Dark Mode is the first-visit default. The Light/Dark preference is stored separately from learner progress and restored before the app renders. CodeMirror switches themes with the application.
- Responsive layout keeps chapter navigation fixed and scrolls the chapter list only if its contents exceed the available height. The main learning content scrolls independently.
- Exercises can be repeated. Chapters unlock after finishing the previous chapter; progress and once-only XP are stored in localStorage. “Von vorn beginnen” changes the selected exercise without erasing progress.
- DOM exercises show a live, sandboxed preview. Hidden behavior checks use a separate iframe that runs the same learner source with appended assertions, so test actions do not replace or consume the visible preview.
- Automated tests cover output grading, object and method behavior, array mutations, DOM events, exercise model solutions, and progress persistence.

## Oracle SQL learning path

- Use the language selector to open the separate SQL path. It contains 12 topics and 37 exercises with independent SQL XP/progress and a seeded practice database (`students`, `courses`, `employees`, `departments`, `orders`).
- FreeSQL is not called by this browser app. The lessons execute locally through SQL.js (SQLite compiled to WebAssembly) with an explicit, limited Oracle-syntax compatibility layer for the taught subset: Oracle-style types in schema examples, `DUAL`, `NVL`, `TO_CHAR`, `TO_DATE`, `SYSDATE`, `FETCH FIRST`, and simple `ROWNUM` conditions. This is not Oracle Database and is not full Oracle compatibility. Date formats, implicit conversions, optimizer behavior, PL/SQL, and many Oracle-specific features are not simulated. The layer translates row limits internally and rejects `LIMIT` in learner SQL.
- Queries are graded by returned columns/values or by verified database changes for DML exercises. Reset starts each run with the documented seeded dataset. No database credentials are stored in client code.

## Runner limits

Learner source executes in an iframe with `sandbox="allow-scripts"` and no same-origin permission. A Content Security Policy disables network connections and external resources. The hidden test iframe is removed after completion or a 1.5 second parent-side timeout; the visible preview has its own watchdog and is reset if execution never completes. Message events are accepted only from the expected iframe window and run identifier.

This reduces access to the parent app but does not make arbitrary JavaScript safe against every attack. Browser vulnerabilities, resource exhaustion, timing differences, and asynchronous work after the synchronous completion signal remain limitations. Do not use this browser runner as a production service for hostile code; that requires stronger process or server-side isolation.

## Verification status

Verified with pnpm 11.25.0 and Node 24.19.0: `pnpm test` (12 passing tests) and `pnpm build` (Vite 8.3.4). Browser spot checks verified first-visit Dark Mode, saved theme restoration, and successful local execution/grading of Oracle-style `DUAL`, `JOIN`, `ROWNUM`, `NVL`, and `SYSDATE`/`TO_CHAR` examples. The production build reports a large JavaScript chunk warning and lucide-react module directive notices.


