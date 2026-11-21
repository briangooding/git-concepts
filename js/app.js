/* ---------------- Glossary ---------------- */
const G = {
  "git":["Git","A free program that tracks changes to files in a folder by saving snapshots (commits). It runs on your computer, works offline, and was created in 2005 by Linus Torvalds."],
  "github":["GitHub","A website (owned by Microsoft) that hosts Git repositories online and adds collaboration tools: pull requests, issues, code review, permissions, and automated checks. Alternatives include GitLab and Bitbucket."],
  "repository":["Repository (repo)","A project folder that Git is tracking, together with its full history. The history lives in a hidden .git folder inside it. A copy on GitHub is also called a repository."],
  "working-directory":["Working directory","The normal files and folders you see and edit. Also called the working tree. Changes here are not saved by Git until you add and commit them."],
  "staging-area":["Staging area (index)","A holding area between your files and a commit. git add puts changes here; git commit saves whatever is here. It lets you choose exactly what goes into each commit."],
  "commit":["Commit","A saved snapshot of your tracked files, with a message, author, date, and a link to the previous commit. As a verb: to create one with git commit."],
  "hash":["Hash (commit ID / SHA)","The unique ID of a commit: a 40-character code like 3f9a2c1e8b… computed from its contents. You usually only need the first 7 characters."],
  "head":["HEAD","Git's pointer to where you are right now: normally the branch you're on, and therefore its latest commit. HEAD~1 means the commit before that."],
  "branch":["Branch","A movable name that points at a commit. When you commit on a branch, it moves forward to the new commit. Branches let you work on separate things without affecting each other."],
  "main":["main","The default branch name, which by convention holds the official, working version of the project. Older repositories call it master."],
  "merge":["Merge","Combining another branch's commits into the branch you're on. Git does this automatically unless both branches changed the same lines."],
  "fast-forward":["Fast-forward","The simplest merge: your branch has no new commits of its own, so Git just moves its pointer ahead to the other branch's commit. No merge commit is created."],
  "merge-conflict":["Merge conflict","When two branches changed the same part of a file differently, Git can't pick one, so it marks the spot in the file and asks you to decide. You edit, git add, and commit to resolve it."],
  "remote":["Remote","A copy of the repository somewhere else, usually GitHub, saved under a nickname. git remote -v lists them."],
  "origin":["origin","The conventional nickname for the main remote, usually your GitHub repository. git clone sets it up automatically."],
  "upstream":["Upstream","Two meanings. (1) The remote branch your local branch is linked to, set with git push -u, so plain git push/pull know where to go. (2) In forks, the nickname for the original project you forked from."],
  "clone":["Clone","Downloading a full copy of a remote repository, with all its history, to your computer. Also sets up origin."],
  "push":["Push","Uploading your local commits to a remote. Only commits are pushed; uncommitted changes stay on your computer."],
  "pull":["Pull","Downloading new commits from a remote and merging them into your current branch. It's fetch + merge."],
  "fetch":["Fetch","Downloading new commits from a remote without changing your files or branches. Updates the origin/… bookmarks so you can look first."],
  "pull-request":["Pull request (PR)","A GitHub page proposing to merge one branch into another. It shows the changes, runs checks, and collects reviews and comments. GitLab calls it a merge request."],
  "fork":["Fork","Your own copy of someone else's GitHub repository, under your account. You push to your fork and open a pull request to the original."],
  "diff":["Diff","A line-by-line comparison of two versions. Lines starting with - were removed, + were added."],
  "untracked":["Untracked file","A file in your folder that Git has never been told to track. Git ignores it until you git add it."],
  "tracked":["Tracked file","A file Git knows about because it was added and committed at some point. Git reports when tracked files change."],
  "gitignore":[".gitignore","A file listing names and patterns Git should never track, like secrets, dependency folders, and build output."],
  "stash":["Stash","A shelf for uncommitted changes. git stash saves and removes them; git stash pop brings them back."],
  "revert":["Revert","Creating a new commit that undoes an earlier commit. Safe for shared history because it adds rather than removes."],
  "reset":["Reset","Moving a branch pointer back to an earlier commit. --soft keeps changes staged, --mixed keeps them unstaged, --hard deletes them. Avoid on pushed commits."],
  "terminal":["Terminal (command line, shell)","A text window where you type commands instead of clicking. This guide uses Git Bash, which comes with Git for Windows. Windows also has PowerShell and Command Prompt, but some commands in this guide only work in Git Bash."],
  "flag":["Flag (option)","An extra setting added to a command, starting with - or --. Example: -m in git commit -m \"msg\". Short flags have one dash and one letter; long flags have two dashes and a word."],
  "ssh":["SSH key","A pair of files (a private key kept on your computer, and a public key you give GitHub) that proves who you are without a password. Created in Git Bash with ssh-keygen -t ed25519; the files go in C:\\Users\\you\\.ssh."],
  "pat":["Personal access token","A long password-like string generated in GitHub Settings → Developer settings, used instead of your password when Git asks for one over HTTPS. On Windows, Git Credential Manager usually makes this unnecessary."],
  "ci":["CI (continuous integration)","Automated checks, like running tests, that run every time you push or open a PR. On GitHub this is usually GitHub Actions."],
  "switch":["Switch / checkout","Moving to a different branch, which changes your files to match it. git switch is the modern command; git checkout is the older one that also does other things."],
  "squash":["Squash","Combining several commits into one. GitHub's 'Squash and merge' does this when merging a PR."],
  "rebase":["Rebase","Re-applying your commits on top of another commit, as if you'd started from there. Gives a straight-line history. Like reset, avoid on commits others already have."],
  "origin-main":["origin/main","A read-only bookmark of where main was on GitHub the last time you fetched or pulled. It updates only when you talk to GitHub."],
};

/* ---------------- Cheat sheet data ---------------- */
const CHEAT = [
 ["Setup (once)", [["git config --global user.name \"Name\"","Set your name for commits"],["git config --global user.email \"you@x.com\"","Set your email for commits"],["git config --global init.defaultBranch main","Name new branches main"],["git config --global core.editor \"code --wait\"","Use VS Code for commit messages"]]],
 ["Start", [["git init","Make the current folder a repository"],["git clone <url>","Download a repository from GitHub"]]],
 ["Daily loop", [["git status","Where are my changes?"],["git add <file>","Stage one file"],["git add .","Stage everything here"],["git commit -m \"msg\"","Save staged changes"],["git commit -am \"msg\"","Stage tracked changes and commit"]]],
 ["Look", [["git log --oneline","Short history"],["git log --oneline --graph --all","History of all branches as a graph"],["git diff","Unstaged changes"],["git diff --staged","What will be committed"],["git show <hash>","One commit in detail"]]],
 ["Branches", [["git branch","List branches"],["git switch -c <name>","Create and switch to a branch"],["git switch <name>","Switch branch"],["git merge <name>","Merge a branch into the current one"],["git branch -d <name>","Delete a merged branch"]]],
 ["GitHub", [["git remote add origin <url>","Connect to a GitHub repository"],["git remote -v","Show remotes"],["git push -u origin <branch>","First push of a branch"],["git push","Upload commits"],["git pull","Download and merge"],["git fetch","Download only"],["gh pr create --fill","Open a PR from the terminal"]]],
 ["Undo", [["git restore <file>","Discard edits to a file"],["git restore --staged <file>","Unstage, keep edits"],["git commit --amend","Redo the last commit (unpushed)"],["git reset --soft HEAD~1","Undo last commit, keep changes (unpushed)"],["git revert <hash>","Undo a pushed commit safely"],["git stash / git stash pop","Shelve and restore changes"],["git merge --abort","Cancel a conflicted merge"],["git reflog","Find lost commits"]]],
];

/* ---------------- Utilities ---------------- */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const store = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d }catch(e){ return d } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)) }catch(e){} }
};

/* ---------------- Navigation ---------------- */
const chapters = $$("section.ch").map(s => ({id: s.id.slice(3), title: s.dataset.title, grp: s.dataset.grp, el: s}));
let done = new Set(store.get("gfg-done", []));
function buildNav(){
  let html = "", lastG = "", n = 0;
  for (const c of chapters){
    n++;
    if (c.grp !== lastG){ html += `<li class="grp">${esc(c.grp)}</li>`; lastG = c.grp; }
    html += `<li><a href="#${c.id}" data-id="${c.id}" class="${done.has(c.id) ? "done" : ""}"><span class="n">${String(n).padStart(2,"0")}</span><span>${esc(c.title)}</span><span class="ok">✓</span></a></li>`;
  }
  $("#nav").innerHTML = html;
  $("#progTxt").textContent = `${done.size} of ${chapters.length} chapters done`;
  $("#progBar").style.width = (done.size / chapters.length * 100) + "%";
}
function show(){
  const id = (location.hash || "#start").slice(1);
  let idx = chapters.findIndex(c => c.id === id);
  if (idx < 0){
    // a glossary anchor like #g-commit
    if (id.startsWith("g-")) { idx = chapters.findIndex(c => c.id === "glossary"); }
    else idx = 0;
  }
  const c = chapters[idx];
  chapters.forEach(x => x.el.hidden = x !== c);
  $$("#nav a").forEach(a => { if (a.dataset.id === c.id) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  const prev = chapters[idx-1], next = chapters[idx+1];
  $("#prevBtn").hidden = !prev; if (prev){ $("#prevBtn").href = "#"+prev.id; $("#prevBtn").textContent = "← " + prev.title; }
  $("#nextBtn").hidden = !next; if (next){ $("#nextBtn").href = "#"+next.id; $("#nextBtn").textContent = next.title + " →"; }
  $("#doneBtn").textContent = done.has(c.id) ? "✓ Done" : "Mark chapter done";
  $("#doneBtn").dataset.id = c.id;
  $("#chfoot").classList.toggle("wide", c.el.classList.contains("wide"));
  $("#curTitle").textContent = c.title;
  $("#rail").classList.remove("open");
  hidePop();
  if (id.startsWith("g-")) { const t = document.getElementById(id); if (t) t.scrollIntoView({block:"center"}); }
  else window.scrollTo(0,0);
  if (c.id === "sandbox") setTimeout(() => $("#sbIn").focus({preventScroll:true}), 50);
}
$("#doneBtn").addEventListener("click", e => {
  const id = e.currentTarget.dataset.id;
  done.has(id) ? done.delete(id) : done.add(id);
  store.set("gfg-done", [...done]); buildNav(); show();
});
$("#menuBtn").addEventListener("click", () => $("#rail").classList.toggle("open"));
addEventListener("hashchange", show);

/* ---------------- Command strips: copy + try ---------------- */
$$(".sh").forEach(sh => {
  const code = sh.querySelector("code").textContent;
  const b = document.createElement("div"); b.className = "btns";
  b.innerHTML = `<button type="button" data-a="copy">Copy</button><button type="button" data-a="try">Try ▸</button>`;
  sh.appendChild(b);
  b.addEventListener("click", ev => {
    const a = ev.target.dataset.a; if (!a) return;
    if (a === "copy"){
      const done = () => { ev.target.textContent = "Copied"; setTimeout(() => ev.target.textContent = "Copy", 1200); };
      try { navigator.clipboard.writeText(code).then(done, () => selectText(sh.querySelector("code"))); } catch(e){ selectText(sh.querySelector("code")); }
    } else { tryCmd(code); }
  });
});
function selectText(el){ const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
function tryCmd(code){ location.hash = "sandbox"; setTimeout(() => { const i = $("#sbIn"); i.value = code; i.focus(); }, 60); }

/* ---------------- Term popovers ---------------- */
const pop = $("#pop"); let popFor = null;
function hidePop(){ pop.hidden = true; popFor = null; }
document.addEventListener("click", e => {
  const t = e.target.closest(".t");
  if (t){
    e.preventDefault();
    if (popFor === t){ hidePop(); return; }
    const g = G[t.dataset.t]; if (!g) return;
    pop.innerHTML = `<b>${esc(g[0])}</b>${esc(g[1])}<br><a class="more" href="#g-${t.dataset.t}">Open in glossary →</a>`;
    pop.hidden = false; popFor = t;
    const r = t.getBoundingClientRect(), pw = pop.offsetWidth;
    let left = r.left + scrollX; left = Math.max(16 + scrollX, Math.min(left, scrollX + document.documentElement.clientWidth - pw - 16));
    pop.style.left = left + "px"; pop.style.top = (r.bottom + scrollY + 8) + "px";
    return;
  }
  if (!e.target.closest("#pop")) hidePop();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") hidePop(); });

/* ---------------- Glossary + cheat sheet render ---------------- */
function renderGloss(q=""){
  q = q.toLowerCase();
  $("#gloss").innerHTML = Object.entries(G).sort((a,b) => a[1][0].localeCompare(b[1][0]))
    .filter(([k,v]) => !q || (v[0]+" "+v[1]).toLowerCase().includes(q))
    .map(([k,v]) => `<div id="g-${k}"><dt>${esc(v[0])}</dt><dd>${esc(v[1])}</dd></div>`).join("") || `<div><dd class="empty">No terms match.</dd></div>`;
}
$("#gq").addEventListener("input", e => renderGloss(e.target.value));
$("#cheat").innerHTML = CHEAT.map(([g, rows]) => `<h2>${esc(g)}</h2><div class="tbl"><table><tr><th>Command</th><th>Does</th></tr>${rows.map(r => `<tr><td><code>${esc(r[0])}</code></td><td>${esc(r[1])}</td></tr>`).join("")}</table></div>`).join("");

/* ---------------- Offline support ---------------- */
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
