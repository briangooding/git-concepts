# CLAUDE.md

## Owner preferences

- **Don't use Claude-hosted resources when the work can live somewhere else.** Don't publish Claude Artifacts, Claude Docs or other claude.ai-hosted pages for this project. Host web apps on GitHub Pages and keep files in this repository.
- Keep each project in its own repository. Don't put unrelated work in another project's repo.

## Project

Git Field Guide: a static web app for learning Git and GitHub, with step-by-step lessons, a clickable glossary and a simulated Git terminal (the "Sandbox").

- Live site: https://briangooding.github.io/git-concepts/
- Hosting: GitHub Pages, deployed from a branch (`main`, `/ (root)`). Every push to `main` goes live in a minute or two. No Actions workflow is needed. Don't add one, because it would compete with the branch deploy.
- No build step and no dependencies. Plain HTML, CSS and JS.

### Files

- `index.html`: page structure and all lesson content. Each chapter is a `<section class="ch" id="ch-<name>">`. Glossary terms in the text are `<button class="t" data-t="<key>">`.
- `css/styles.css`: styles. Colors are tokens on `:root`, redefined for dark mode.
- `js/app.js`: navigation (hash routing), glossary data (`G`), cheat sheet data (`CHEAT`), popovers, progress tracking (localStorage), service-worker registration.
- `js/sandbox.js`: the simulated Git (state object `st`, one function per git subcommand), the panel rendering and the guided exercise (`TASKS`).
- `sw.js`: offline cache. **Bump `VERSION` whenever you change cached files.**
- `manifest.webmanifest`, `icons/`: what the browser needs to install it as an app.

### Testing

Serve the site locally (`python3 -m http.server 8000`) and check it in a browser. A service worker only runs when the page is served over http(s), not from `file://`.
