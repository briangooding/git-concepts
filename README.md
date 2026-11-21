# Git Field Guide

A hands-on web app for learning Git and GitHub on Windows. Every command is explained piece by piece and shows the output you should expect. Words with a dotted underline open a plain-language definition when you click them.

**Live site:** https://briangooding.github.io/git-concepts/

## Audience

Windows 10 and 11 users only. All instructions assume Git for Windows, with commands typed into Git Bash.

## What's inside

- **11 chapters:** how Git thinks, setup, starting a repository, the daily loop, history, branches, push and pull, pull requests, undoing mistakes, merge conflicts, and `.gitignore`
- **Sandbox:** a simulated terminal in the browser, with live panels for your files, the staging area, your local commits and GitHub, plus a guided exercise
- **Cheat sheet** and a searchable **glossary**
- **Installable and works offline:** on a phone use "Add to Home Screen"; on desktop Chrome or Edge use the install icon in the address bar

## Project layout

```
index.html             page structure and all lesson content
css/styles.css         styles (light and dark themes)
js/app.js              navigation, glossary popovers, progress tracking
js/sandbox.js          the simulated Git used in the Sandbox chapter
sw.js                  service worker for offline use
manifest.webmanifest   app name and icons for installing
```

No build step and no dependencies. To run it locally:

```
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` directly also works, but offline mode only runs when the page is served over http(s).

## Deployment

GitHub Pages serves the `main` branch (**Settings → Pages → Deploy from a branch → main, / (root)**). Every push to `main` updates the live site within a minute or two.
