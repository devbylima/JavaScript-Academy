# JavaScript Academy

A friendly, German-language learning app for practicing JavaScript in short exercises.

## Start locally

```sh
npm install
npm run dev
```

The Vite development server prints the local URL. Use `npm run build` to create a production build.

## Current app

- Responsive learning dashboard with chapter navigation, progress, XP, and resume support.
- Ten chapters and ten starter exercises per chapter.
- Editable JavaScript exercises, console output, reset, three hint levels, and explicitly requested sample solutions.
- Completion checks compare observed behavior (console output) with the exercise's expected output; XP is awarded once per exercise.
- Progress is saved in localStorage.
- DOM exercises use an isolated document containing a sample button and output element.

## Execution boundaries

Learner code runs in a sandboxed iframe without same-origin permission. A Content Security Policy disables network connections and external resources. The iframe is removed after completion or a 1.5 second timeout, which also stops runaway synchronous loops. This is a useful browser learning sandbox, not a security boundary for serving arbitrary hostile code: browser vulnerabilities, resource exhaustion before timeout, and browser-specific behavior cannot be ruled out. Do not deploy as a multi-user untrusted-code service without a server-side isolation design.

## Curriculum scope

The interface currently supplies ten runnable starter exercises in each of the ten requested topics. The exercises are working examples with output-based checks; many begin with complete working code so learners can inspect and modify it. A full author-written lesson text and a broad hidden-test suite for every exercise remain future curriculum work. The editor is a plain code textarea at this stage; syntax highlighting and richer DOM preview controls are not included yet.