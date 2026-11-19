/* =================================================================
   SANDBOX: a small Git simulator
   ================================================================= */
const REMOTE_URL = "https://github.com/you/project.git";
let st;
function fresh(){
  return { inited:false, files:{}, index:{}, commits:{}, branches:{}, head:"main", remote:null, tracking:{}, upstream:{}, merging:null, t:0,
           flags:{}, };
}
st = store.get("gfg-sbx", null) || fresh();
const out = $("#sbOut");
function print(text, cls="o"){ const d = document.createElement("div"); d.className = cls; d.textContent = text; out.appendChild(d); }
function note(text){ const d = document.createElement("div"); d.className = "note"; d.textContent = text; out.appendChild(d); }
function save(){ store.set("gfg-sbx", st); }

const headId = () => st.branches[st.head];
const treeOf = id => id ? st.commits[id].tree : {};
const keys = (...objs) => [...new Set(objs.flatMap(o => Object.keys(o)))].sort();
function newId(){ let id; do { id = Math.random().toString(16).slice(2,9).padEnd(7,"0"); } while (st.commits[id]); return id; }
function ancestors(id){ const s = new Set(), stack = id ? [id] : []; while (stack.length){ const c = stack.pop(); if (s.has(c)) continue; s.add(c); stack.push(...st.commits[c].parents); } return s; }
const isAnc = (a, b) => ancestors(b).has(a);
function mergeBase(a, b){ const A = ancestors(a); let best = null; for (const c of ancestors(b)) if (A.has(c) && (!best || st.commits[c].t > st.commits[best].t)) best = c; return best; }

function changes(){
  const H = treeOf(headId()), I = st.index, W = st.files;
  const staged = [], unstaged = [], untracked = [];
  for (const f of keys(H, I)) if (H[f] !== I[f]) staged.push([f, !(f in H) ? "new file" : !(f in I) ? "deleted" : "modified"]);
  for (const f of keys(I, W)){
    if (!(f in I)) { untracked.push(f); continue; }
    if (W[f] !== I[f]) unstaged.push([f, !(f in W) ? "deleted" : "modified"]);
  }
  return {staged, unstaged, untracked};
}
const dirty = () => { const c = changes(); return c.staged.length || c.unstaged.length; };
function untrackedFiles(){ const o = {}; for (const f in st.files) if (!(f in st.index)) o[f] = st.files[f]; return o; }
function checkoutTree(id){ const T = treeOf(id); const u = untrackedFiles(); st.files = {...T, ...u}; st.index = {...T}; }

function tokenize(line){
  const out = []; const re = /"([^"]*)"|'([^']*)'|(\S+)/g; let m;
  while ((m = re.exec(line))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

const HELP = `Shell commands:
  ls                     list files
  cat <file>             print a file
  echo "text" > <file>   create/overwrite a file
  echo "text" >> <file>  add a line to a file
  touch <file>           create an empty file
  rm <file>              delete a file
  clear                  clear the screen
Git commands:
  git init | status | add <file|.> | commit -m "msg" | commit -am "msg"
  git log [--oneline] [--all] | diff [--staged]
  git branch [name] | branch -d <name>
  git switch <name> | switch -c <name> | checkout [-b] <name>
  git merge <branch> | merge --abort
  git restore <file> | restore --staged <file>
  git remote add origin <url> | remote -v
  git push [-u origin <branch>] | pull | fetch`;

function run(line){
  line = line.trim(); if (!line) return;
  print(line, "in");
  const a = tokenize(line);
  try {
    if (a[0] === "git") git(a.slice(1));
    else shell(a, line);
  } catch (e) { print(String(e.message || e), "e"); }
  save(); render();
  out.scrollTop = out.scrollHeight;
}

function shell(a, line){
  const cmd = a[0];
  if (cmd === "help") return print(HELP, "d");
  if (cmd === "clear") { out.innerHTML = ""; return; }
  if (cmd === "ls"){ const f = Object.keys(st.files).sort(); if (a.includes("-a") && st.inited) f.unshift(".git"); return f.length && print(f.join("  ")); }
  if (cmd === "pwd") return print("/home/you/project");
  if (cmd === "cat"){ if (!a[1]) throw Error("cat: which file?"); if (!(a[1] in st.files)) throw Error(`cat: ${a[1]}: No such file or directory`); return print(st.files[a[1]].replace(/\n$/,"")); }
  if (cmd === "touch"){ if (!a[1]) throw Error("touch: missing file name"); for (const f of a.slice(1)) if (!(f in st.files)) st.files[f] = ""; return; }
  if (cmd === "rm"){ if (!a[1]) throw Error("rm: missing file name"); if (!(a[1] in st.files)) throw Error(`rm: ${a[1]}: No such file or directory`); delete st.files[a[1]]; return; }
  if (cmd === "echo"){
    const op = a.findIndex(x => x === ">" || x === ">>");
    const text = a.slice(1, op < 0 ? undefined : op).join(" ");
    if (op < 0) return print(text);
    const f = a[op+1]; if (!f) throw Error("echo: missing file name after " + a[op]);
    st.files[f] = a[op] === ">" ? text + "\n" : (st.files[f] || "") + text + "\n";
    return;
  }
  if (["cd","mkdir","nano","vim","code"].includes(cmd)) return print(`The sandbox is a single folder, so '${cmd}' isn't needed here. Edit files by clicking them on the right, or with echo.`, "d");
  throw Error(`${cmd}: command not found. Type 'help' to see what the sandbox understands.`);
}

function needRepo(){ if (!st.inited) throw Error("fatal: not a git repository (or any of the parent directories): .git\n(Run git init first.)"); }

function git(a){
  const sub = a[0], rest = a.slice(1);
  if (!sub || sub === "help") return print(HELP, "d");
  if (sub === "--version") return print("git version 2.47.1 (sandbox)");
  if (sub === "init"){
    if (st.inited) return print("Reinitialized existing Git repository in /home/you/project/.git/");
    st.inited = true; return print("Initialized empty Git repository in /home/you/project/.git/");
  }
  if (sub === "config") return print("(The sandbox doesn't need config. On your real computer, set user.name and user.email once.)", "d");
  needRepo();
  const fn = {status, add, commit, log, diff, branch, switch: sw, checkout, merge, restore, remote, push, pull, fetch, show: gshow}[sub];
  if (!fn) throw Error(`git: '${sub}' is not a git command in this sandbox. Type 'help'.`);
  fn(rest);
}

function status(){
  print(`On branch ${st.head}`);
  const up = st.upstream[st.head] && st.tracking[st.head];
  if (up){
    const L = headId(), R = st.tracking[st.head];
    const ahead = [...ancestors(L)].filter(x => !ancestors(R).has(x)).length, behind = [...ancestors(R)].filter(x => !ancestors(L).has(x)).length;
    if (!ahead && !behind) print(`Your branch is up to date with 'origin/${st.head}'.`);
    else if (ahead && !behind) print(`Your branch is ahead of 'origin/${st.head}' by ${ahead} commit${ahead>1?"s":""}.\n  (use "git push" to publish your local commits)`, "y");
    else if (!ahead) print(`Your branch is behind 'origin/${st.head}' by ${behind} commit${behind>1?"s":""}.\n  (use "git pull" to update your local branch)`, "y");
    else print(`Your branch and 'origin/${st.head}' have diverged. (use "git pull" to merge)`, "y");
  }
  if (!headId()) print("\nNo commits yet");
  const c = changes();
  if (st.merging){
    print(`\nYou have unmerged paths.\n  (fix conflicts and run "git commit")\n  (use "git merge --abort" to abort the merge)`, "y");
    if (st.merging.conflicts.length) print("\nUnmerged paths:\n" + st.merging.conflicts.map(f => `\tboth modified:   ${f}`).join("\n"), "e");
  }
  const conf = new Set(st.merging?.conflicts || []);
  const sg = c.staged.filter(([f]) => !conf.has(f)), us = c.unstaged.filter(([f]) => !conf.has(f));
  if (sg.length) print(`\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n` + sg.map(([f,t]) => `\t${(t+":").padEnd(12)}${f}`).join("\n"), "g");
  if (us.length) print(`\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n` + us.map(([f,t]) => `\t${(t+":").padEnd(12)}${f}`).join("\n"), "e");
  if (c.untracked.length) print(`\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n` + c.untracked.map(f => "\t"+f).join("\n"), "e");
  if (!sg.length && !us.length && !c.untracked.length && !conf.size){
    if (!headId()) print(`\nnothing to commit (create/copy files and use "git add" to track)`);
    else print("\nnothing to commit, working tree clean");
  } else if (!sg.length && !conf.size && !st.merging){
    print(us.length ? `\nno changes added to commit (use "git add" and/or "git commit -a")` : `\nnothing added to commit but untracked files present (use "git add" to track)`, "d");
  }
}

function add(a){
  if (!a.length) throw Error("Nothing specified, nothing added.\nhint: Maybe you wanted to say 'git add .'?");
  const all = a.some(x => x === "." || x === "-A" || x === "--all");
  const targets = all ? keys(st.files, st.index) : a;
  for (const f of targets){
    if (f in st.files) st.index[f] = st.files[f];
    else if (f in st.index) delete st.index[f];
    else throw Error(`fatal: pathspec '${f}' did not match any files`);
    if (st.merging) st.merging.conflicts = st.merging.conflicts.filter(x => x !== f);
    if ((st.files[f] || "").includes("<<<<<<<")) note(`Heads up: ${f} still contains conflict markers (<<<<<<<). Git lets you add it anyway, but you probably want to edit it first.`);
  }
}

function commit(a){
  let msg = null, all = false;
  for (let i = 0; i < a.length; i++){
    const x = a[i];
    if (x === "-m" || x === "-am" || x === "-a" || x === "--message"){ if (x === "-am" || x === "-a") all = true; if (x !== "-a") msg = a[++i]; }
    else if (x === "--amend") throw Error("--amend isn't simulated here. On your real computer it replaces the last commit.");
  }
  if (all) for (const [f,t] of changes().unstaged) { if (t === "deleted") delete st.index[f]; else st.index[f] = st.files[f]; if (st.merging) st.merging.conflicts = st.merging.conflicts.filter(x=>x!==f); }
  if (st.merging && st.merging.conflicts.length) throw Error("error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use 'git add <file>'\nhint: as appropriate to mark resolution and make a commit.");
  if (!msg){
    if (st.merging) msg = `Merge branch '${st.merging.label}'`;
    else throw Error(`The sandbox needs a message: git commit -m "Describe your change"\n(Real Git would open a text editor here so you could type one.)`);
  }
  const H = treeOf(headId());
  const c = changes();
  if (!c.staged.length && !st.merging){
    if (c.unstaged.length || c.untracked.length) throw Error(`nothing added to commit but changes present (use "git add" to stage them first)`);
    throw Error("nothing to commit, working tree clean");
  }
  const id = newId();
  const parents = headId() ? [headId()] : [];
  if (st.merging) parents.push(st.merging.theirs);
  st.commits[id] = {msg, tree:{...st.index}, parents, t: ++st.t, branch: st.head};
  const root = !headId();
  st.branches[st.head] = id;
  if (st.head !== "main") st.flags.branchCommit = true;
  if (st.merging){ if (st.head === "main") st.flags.merged = true; st.merging = null; st.flags.resolved = true; }
  const n = c.staged.length;
  print(`[${st.head}${root ? " (root-commit)" : ""} ${id}] ${msg}\n ${n} file${n===1?"":"s"} changed`);
}

function decorations(){
  const d = {};
  const addD = (id, s) => { if (!id) return; (d[id] = d[id] || []).push(s); };
  for (const b in st.branches) addD(st.branches[b], b === st.head ? `HEAD -> ${b}` : b);
  for (const b in st.tracking) addD(st.tracking[b], `origin/${b}`);
  for (const id in d) d[id].sort((x,y) => (y.startsWith("HEAD")?1:0) - (x.startsWith("HEAD")?1:0));
  return d;
}
function log(a){
  if (!headId() && !a.includes("--all")) throw Error(`fatal: your current branch '${st.head}' does not have any commits yet`);
  const one = a.includes("--oneline"), all = a.includes("--all");
  const tips = all ? [...Object.values(st.branches), ...Object.values(st.tracking)] : [headId()];
  const set = new Set(); tips.forEach(t => ancestors(t).forEach(x => set.add(x)));
  const list = [...set].sort((x,y) => st.commits[y].t - st.commits[x].t);
  const dec = decorations();
  for (const id of list){
    const c = st.commits[id], ds = dec[id] ? ` (${dec[id].join(", ")})` : "";
    if (one) { print(`${id}${ds} ${c.msg}`, "y"); }
    else {
      print(`commit ${id}${ds}`, "y");
      if (c.parents.length > 1) print(`Merge: ${c.parents.join(" ")}`);
      print(`Author: You <you@example.com>\n\n    ${c.msg}\n`);
    }
  }
  if (a.includes("--graph")) note("--graph isn't drawn in this text output; look at the Local repository panel on the right for the picture.");
}
function lineDiff(f, A, B){
  const a = (A ?? "").split("\n").filter((x,i,arr) => !(i === arr.length-1 && x === "")), b = (B ?? "").split("\n").filter((x,i,arr) => !(i === arr.length-1 && x === ""));
  print(`diff --git a/${f} b/${f}`, "d");
  print(`--- ${A === undefined ? "/dev/null" : "a/"+f}\n+++ ${B === undefined ? "/dev/null" : "b/"+f}`, "d");
  // simple LCS diff
  const n = a.length, m = b.length, L = Array.from({length:n+1}, () => Array(m+1).fill(0));
  for (let i = n-1; i >= 0; i--) for (let j = m-1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i+1][j+1]+1 : Math.max(L[i+1][j], L[i][j+1]);
  let i = 0, j = 0;
  while (i < n || j < m){
    if (i < n && j < m && a[i] === b[j]) { print(" " + a[i]); i++; j++; }
    else if (j < m && (i >= n || L[i][j+1] >= L[i+1][j])) { print("+" + b[j], "g"); j++; }
    else { print("-" + a[i], "e"); i++; }
  }
}
function diff(a){
  const staged = a.includes("--staged") || a.includes("--cached");
  const A = staged ? treeOf(headId()) : st.index, B = staged ? st.index : st.files;
  let any = false;
  for (const f of keys(A, B)){
    if (!staged && !(f in st.index)) continue; // untracked files aren't shown by git diff
    if (A[f] !== B[f]) { any = true; lineDiff(f, A[f], B[f]); }
  }
  if (!any) note(staged ? "No staged changes. (git diff --staged compares the staging area to the last commit.)" : "No unstaged changes. (Plain git diff ignores staged and untracked files. Try git diff --staged.)");
}
function gshow(a){
  const id = a[0] === "HEAD" || !a[0] ? headId() : a[0];
  const c = st.commits[id]; if (!c) throw Error(`fatal: bad revision '${a[0]}'`);
  print(`commit ${id}`, "y"); print(`\n    ${c.msg}\n`);
  const P = treeOf(c.parents[0]);
  for (const f of keys(P, c.tree)) if (P[f] !== c.tree[f]) lineDiff(f, P[f], c.tree[f]);
}

function branch(a){
  if (!a.length || a[0] === "-a" || a[0] === "--list"){
    const names = keys(st.branches); if (!st.branches[st.head]) names.push(st.head);
    [...new Set(names)].sort().forEach(b => print((b === st.head ? "* " : "  ") + b, b === st.head ? "g" : "o"));
    if (a[0] === "-a") Object.keys(st.tracking).forEach(b => print("  remotes/origin/" + b, "e"));
    return;
  }
  if (a[0] === "-d" || a[0] === "-D"){
    const b = a[1]; if (!st.branches[b]) throw Error(`error: branch '${b}' not found.`);
    if (b === st.head) throw Error(`error: Cannot delete branch '${b}' checked out. Switch to another branch first.`);
    if (a[0] === "-d" && !isAnc(st.branches[b], headId())) throw Error(`error: the branch '${b}' is not fully merged.\nhint: If you are sure you want to delete it, run 'git branch -D ${b}'.`);
    const id = st.branches[b]; delete st.branches[b]; delete st.upstream[b];
    return print(`Deleted branch ${b} (was ${id}).`);
  }
  if (a[0] === "-M" || a[0] === "-m"){
    const nb = a[1]; if (!nb) throw Error("fatal: branch name required");
    if (st.branches[st.head]) { st.branches[nb] = st.branches[st.head]; delete st.branches[st.head]; }
    st.head = nb; return;
  }
  createBranch(a[0]);
}
function createBranch(b){
  if (!/^[\w./-]+$/.test(b)) throw Error(`fatal: '${b}' is not a valid branch name.`);
  if (st.branches[b]) throw Error(`fatal: a branch named '${b}' already exists`);
  if (!headId()) throw Error(`fatal: not a valid object name: '${st.head}'.\n(Make your first commit before creating branches.)`);
  st.branches[b] = headId();
}
function sw(a){
  let create = false, b = null;
  for (const x of a){ if (x === "-c" || x === "-b" || x === "--create") create = true; else if (x !== "--") b = x; }
  if (!b) throw Error("fatal: missing branch name");
  if (create){
    if (!headId()) { if (st.branches[b]) throw Error(`fatal: a branch named '${b}' already exists`); st.head = b; return print(`Switched to a new branch '${b}'`); }
    createBranch(b); st.head = b; return print(`Switched to a new branch '${b}'`);
  }
  if (b === st.head) return print(`Already on '${b}'`);
  if (!st.branches[b]){
    if (st.tracking[b]) { st.branches[b] = st.tracking[b]; st.upstream[b] = true; }
    else throw Error(`fatal: invalid reference: ${b}\n(To create it, use git switch -c ${b})`);
  }
  if (st.merging) throw Error("error: you need to resolve your current merge first (or run git merge --abort).");
  if (dirty()) throw Error(`error: You have uncommitted changes that would be lost or carried over.\nPlease commit your changes or stash them before you switch branches.\n(Real Git sometimes lets you carry changes along; the sandbox keeps it strict.)`);
  st.head = b; checkoutTree(st.branches[b]);
  print(`Switched to branch '${b}'`);
}
function checkout(a){
  if (a[0] === "--" || (a.length && !a[0].startsWith("-") && (a[0] in st.files) && !st.branches[a[0]])) return restore(a.filter(x => x !== "--"));
  return sw(a);
}

function merge(a){
  if (a[0] === "--abort"){
    if (!st.merging) throw Error("fatal: There is no merge to abort (MERGE_HEAD missing).");
    st.merging = null; checkoutTree(headId()); return print("Merge aborted. Your files are back to how they were before the merge.");
  }
  const name = a[0]; if (!name) throw Error("fatal: which branch? e.g. git merge feature");
  let theirs = st.branches[name];
  if (!theirs && name.startsWith("origin/")) theirs = st.tracking[name.slice(7)];
  if (!theirs) throw Error(`merge: ${name} - not something we can merge`);
  if (st.merging) throw Error("error: Merging is not possible because you have unmerged files.");
  if (dirty()) throw Error("error: Your local changes would be overwritten by merge.\nPlease commit your changes or stash them before you merge.");
  doMerge(theirs, name);
}
function doMerge(theirs, label){
  const ours = headId();
  if (!ours){ st.branches[st.head] = theirs; checkoutTree(theirs); return print(`Fast-forward to ${theirs}`); }
  if (theirs === ours || isAnc(theirs, ours)) return print("Already up to date.");
  if (isAnc(ours, theirs)){
    const before = treeOf(ours);
    st.branches[st.head] = theirs; checkoutTree(theirs);
    print(`Updating ${ours}..${theirs}\nFast-forward`);
    const ch = keys(before, treeOf(theirs)).filter(f => before[f] !== treeOf(theirs)[f]);
    ch.forEach(f => print(" " + f, "g"));
    if (st.head === "main") st.flags.merged = true;
    return;
  }
  const B = treeOf(mergeBase(ours, theirs)), O = treeOf(ours), T = treeOf(theirs);
  const result = {}, conflicts = [];
  for (const f of keys(B, O, T)){
    const b = B[f], o = O[f], t = T[f];
    let v;
    if (o === t) v = o; else if (o === b) v = t; else if (t === b) v = o;
    else { conflicts.push(f); v = conflictText(o ?? "", t ?? "", label); }
    if (v !== undefined) result[f] = v;
  }
  const u = untrackedFiles();
  st.files = {...result, ...u};
  st.index = {...result}; conflicts.forEach(f => { if (f in O) st.index[f] = O[f]; else delete st.index[f]; });
  st.merging = {theirs, label, conflicts};
  for (const f of keys(O, result)) if (O[f] !== result[f] && !conflicts.includes(f)) print("Auto-merging " + f);
  if (conflicts.length){
    conflicts.forEach(f => print(`Auto-merging ${f}\nCONFLICT (content): Merge conflict in ${f}`, "e"));
    print("Automatic merge failed; fix conflicts and then commit the result.", "e");
    note("Click the conflicted file on the right to edit it. Remove the <<<<<<<, =======, and >>>>>>> lines, keep the text you want, then: git add <file> and git commit -m \"Merge ...\"");
    st.flags.conflict = true;
    return;
  }
  commit(["-m", `Merge branch '${label}'`]);
  print("Merge made by the 'ort' strategy.");
}

function conflictText(o, t, label){
  const A = o.replace(/\n$/,"").split("\n"), B = t.replace(/\n$/,"").split("\n");
  let p = 0; while (p < A.length && p < B.length && A[p] === B[p]) p++;
  let q = 0; while (q < A.length-p && q < B.length-p && A[A.length-1-q] === B[B.length-1-q]) q++;
  const pre = A.slice(0,p), suf = A.slice(A.length-q), mo = A.slice(p, A.length-q), mt = B.slice(p, B.length-q);
  return [...pre, "<<<<<<< HEAD", ...mo, "=======", ...mt, ">>>>>>> " + label, ...suf].join("\n") + "\n";
}
function restore(a){
  const staged = a.includes("--staged"); const fs = a.filter(x => !x.startsWith("--"));
  if (!fs.length) throw Error("fatal: you must specify path(s) to restore");
  const H = treeOf(headId());
  const targets = fs.includes(".") ? keys(st.index, st.files, H) : fs;
  for (const f of targets){
    if (staged){ if (f in H) st.index[f] = H[f]; else if (f in st.index) delete st.index[f]; else if (!fs.includes(".")) throw Error(`error: pathspec '${f}' did not match any file(s) known to git`); }
    else { if (f in st.index) st.files[f] = st.index[f]; else if (!fs.includes(".")) throw Error(`error: pathspec '${f}' did not match any file(s) known to git\n(Untracked files aren't known to Git, so there's nothing to restore them to.)`); }
  }
}

function remote(a){
  if (!a.length){ if (st.remote) print("origin"); return; }
  if (a[0] === "-v"){ if (!st.remote) return; return print(`origin\t${st.remote.url} (fetch)\norigin\t${st.remote.url} (push)`); }
  if (a[0] === "add"){
    if (a[1] !== "origin") throw Error("The sandbox supports one remote named origin: git remote add origin " + REMOTE_URL);
    if (st.remote) throw Error("error: remote origin already exists.");
    if (!a[2]) throw Error("usage: git remote add origin <url>");
    st.remote = {url:a[2], branches:{}}; return;
  }
  if (a[0] === "remove" || a[0] === "rm"){ st.remote = null; st.tracking = {}; st.upstream = {}; return; }
  throw Error("Supported: git remote add origin <url>, git remote -v");
}
function noRemote(){ throw Error(`fatal: 'origin' does not appear to be a git repository\nfatal: Could not read from remote repository.\n(Connect one first: git remote add origin ${REMOTE_URL})`); }
function push(a){
  if (!st.remote) noRemote();
  if (a.includes("--force") || a.includes("-f")) throw Error("The sandbox won't force-push. On a shared branch this would delete teammates' commits. Run git pull, then git push.");
  const u = a.includes("-u") || a.includes("--set-upstream");
  const pos = a.filter(x => !x.startsWith("-"));
  if (pos[0] && pos[0] !== "origin") throw Error(`fatal: '${pos[0]}' does not appear to be a git repository`);
  const b = pos[1] || st.head;
  if (!pos[1] && !st.upstream[b] && !u) throw Error(`fatal: The current branch ${b} has no upstream branch.\nTo push the current branch and set the remote as upstream, use\n\n    git push --set-upstream origin ${b}\n\n(or the short version: git push -u origin ${b})`);
  const L = st.branches[b];
  if (!L) throw Error(`error: src refspec ${b} does not match any\n(You need at least one commit on '${b}' before you can push it.)`);
  const R = st.remote.branches[b];
  print(`To ${st.remote.url}`);
  if (R === L) { print("Everything up-to-date"); }
  else if (R && !isAnc(R, L)) throw Error(` ! [rejected]        ${b} -> ${b} (fetch first)\nerror: failed to push some refs to '${st.remote.url}'\nhint: Updates were rejected because the remote contains work that you do not\nhint: have locally. Run 'git pull' first, then push again.`);
  else { st.remote.branches[b] = L; st.tracking[b] = L; print(R ? `   ${R}..${L}  ${b} -> ${b}` : ` * [new branch]      ${b} -> ${b}`, "g"); }
  if (u || pos[1]) { if (u && !st.upstream[b]) print(`branch '${b}' set up to track 'origin/${b}'.`); if (u) st.upstream[b] = true; }
  if (b !== "main" && !R) note(`On real GitHub, you'd now see a "Compare & pull request" button for ${b}.`);
}
function fetch(){
  if (!st.remote) noRemote();
  const lines = [];
  for (const b in st.remote.branches) if (st.tracking[b] !== st.remote.branches[b]){ lines.push(`   ${st.tracking[b] || "(new)"}..${st.remote.branches[b]}  ${b} -> origin/${b}`); st.tracking[b] = st.remote.branches[b]; }
  if (lines.length){ print(`From ${st.remote.url}`, "d"); print(lines.join("\n"), "g"); } else print("(nothing new on GitHub)", "d");
}
function pull(a){
  if (!st.remote) noRemote();
  const b = a.filter(x => !x.startsWith("-"))[1] || st.head;
  if (!a.length && !st.upstream[b]) throw Error(`There is no tracking information for the current branch.\nPlease specify which branch you want to merge with, e.g.\n    git pull origin ${b}\nor set it with: git push -u origin ${b}`);
  if (!st.remote.branches[b]) throw Error(`fatal: couldn't find remote ref ${b}`);
  if (dirty()) throw Error("error: Your local changes would be overwritten by merge. Commit or stash them first.");
  fetch();
  const before = headId();
  doMerge(st.tracking[b], `origin/${b}`);
  if (headId() !== before && st.flags.teammate) st.flags.pulled = true;
}

/* Teammate simulation */
let tmN = store.get("gfg-tm", 0);
function teammate(){
  if (!st.remote || !st.remote.branches.main){ print("[GitHub] Push main to GitHub first, then a teammate can add to it.", "d"); out.scrollTop = out.scrollHeight; return; }
  const parent = st.remote.branches.main, T = {...treeOf(parent)};
  tmN++; store.set("gfg-tm", tmN);
  T["CONTRIBUTING.md"] = (T["CONTRIBUTING.md"] || "# How to contribute\n") + `Tip ${tmN}: open a pull request for every change.\n`;
  const id = newId(); st.commits[id] = {msg: tmN === 1 ? "Add contributing guide" : `Update contributing guide (${tmN})`, tree:T, parents:[parent], t: ++st.t, branch:"main"};
  st.remote.branches.main = id; st.flags.teammate = true;
  note(`[GitHub] Your teammate Ana pushed commit ${id} "${st.commits[id].msg}" to main. Your computer doesn't know yet. Try git status (it won't notice either), then git fetch or git pull.`);
  save(); render(); out.scrollTop = out.scrollHeight;
}

/* ---------------- Sandbox rendering ---------------- */
let editing = null;
function render(){
  const c = changes(), conf = new Set(st.merging?.conflicts || []);
  const stat = {}; c.unstaged.forEach(([f,t]) => stat[f] = t); c.untracked.forEach(f => stat[f] = "untracked");
  const wf = Object.keys(st.files).sort();
  $("#vWork").innerHTML = wf.length ? wf.map(f => {
    const s = conf.has(f) ? "conflict" : stat[f] || "clean";
    const label = s === "clean" ? (st.inited && f in st.index ? "unchanged" : "file") : s;
    return `<li><button class="fname" data-f="${esc(f)}">${esc(f)}</button><span class="badge ${s === "clean" ? "clean" : s === "deleted" ? "deleted" : s}">${esc(label)}</span></li>`;
  }).join("") : `<p class="empty">Empty folder. Try: echo "hello" &gt; notes.txt</p>`;
  const del = c.unstaged.filter(([,t]) => t === "deleted");
  if (del.length) $("#vWork").innerHTML += del.map(([f]) => `<li><s>${esc(f)}</s><span class="badge deleted">deleted</span></li>`).join("");
  $("#vStage").innerHTML = !st.inited ? `<p class="empty">No repository yet. Run git init.</p>` :
    c.staged.length ? c.staged.map(([f,t]) => `<li><span>${esc(f)}</span><span class="badge ${t === "new file" ? "new" : t}">${esc(t)}</span></li>`).join("") : `<p class="empty">Nothing staged. Use git add &lt;file&gt;.</p>`;
  $("#vHead").innerHTML = !st.inited ? "No repository yet." : `On branch <b>${esc(st.head)}</b>${st.merging ? ` · <span style="color:var(--danger)">merging ${esc(st.merging.label)}</span>` : ""}`;
  renderGraph();
  renderRemote();
  renderEditor();
  renderTasks();
}
function renderGraph(){
  const ids = Object.keys(st.commits).filter(id => {
    const tips = [...Object.values(st.branches), ...Object.values(st.tracking)];
    return tips.some(t => ancestors(t).has(id));
  }).sort((a,b) => st.commits[b].t - st.commits[a].t);
  if (!ids.length){ $("#vGraph").innerHTML = `<p class="empty">${st.inited ? "No commits yet." : "Run git init to create one."}</p>`; return; }
  // assign lanes: main first, then other branches by first commit time
  // each commit sits in the lane of the branch it was made on (main is always lane 0)
  const names = ["main"]; [...ids].reverse().forEach(id => { const n = st.commits[id].branch; if (!names.includes(n)) names.push(n); });
  const lane = {}; ids.forEach(id => lane[id] = names.indexOf(st.commits[id].branch));
  const lanesUsed = [...new Set(ids.map(i => lane[i]))].sort(); const lx = {}; lanesUsed.forEach((l,i) => lx[l] = 14 + i*18);
  const rowH = 30, y = {}; ids.forEach((id,i) => y[id] = 16 + i*rowH);
  const textX = 14 + lanesUsed.length*18 + 6;
  const dec = decorations();
  const colors = ["var(--accent)","var(--stage)","var(--remote)","var(--danger)","var(--muted)"];
  let svg = "";
  ids.forEach(id => st.commits[id].parents.forEach(p => { if (y[p] === undefined) return;
    const x1 = lx[lane[id]], x2 = lx[lane[p]], y1 = y[id], y2 = y[p];
    svg += x1 === x2 ? `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colors[lane[p]%5]}" stroke-width="2"/>`
      : `<path d="M${x1} ${y1} C ${x1} ${y1+rowH*.8}, ${x2} ${y2-rowH*.8}, ${x2} ${y2}" fill="none" stroke="${colors[Math.max(lane[id],lane[p])%5]}" stroke-width="2"/>`;
  }));
  let w = 340;
  ids.forEach(id => {
    const c = st.commits[id], x = lx[lane[id]];
    const isHead = id === headId();
    svg += `<circle cx="${x}" cy="${y[id]}" r="${isHead ? 6 : 5}" fill="${isHead ? colors[lane[id]%5] : "var(--surface)"}" stroke="${colors[lane[id]%5]}" stroke-width="2"/>`;
    let tx = textX;
    svg += `<text x="${tx}" y="${y[id]+4}" fill="var(--muted)">${id}</text>`; tx += 60;
    (dec[id] || []).forEach(d => {
      const isO = d.startsWith("origin/"), wd = d.length*7 + 12;
      svg += `<rect x="${tx}" y="${y[id]-9}" width="${wd}" height="18" rx="9" fill="${isO ? "var(--remote-soft)" : "var(--accent-soft)"}"/><text x="${tx+6}" y="${y[id]+4}" fill="${isO ? "var(--remote)" : "var(--accent)"}" font-weight="500">${esc(d)}</text>`;
      tx += wd + 5;
    });
    const msg = c.msg.length > 34 ? c.msg.slice(0,33)+"…" : c.msg;
    svg += `<text x="${tx+2}" y="${y[id]+4}" fill="var(--ink)" style="font-family:var(--f-body);font-size:12.5px">${esc(msg)}</text>`;
    w = Math.max(w, tx + msg.length*6.6 + 12);
  });
  const h = 16 + ids.length*rowH - 8;
  $("#vGraph").innerHTML = `<svg width="${Math.ceil(w)}" height="${h}" viewBox="0 0 ${Math.ceil(w)} ${h}" role="img" aria-label="Commit graph">${svg}</svg>`;
}
function renderRemote(){
  const el = $("#vRemote");
  if (!st.remote){ el.innerHTML = `<p class="sub">Not connected. After your first commit, run:</p><button class="hint" data-cmd="git remote add origin ${REMOTE_URL}">git remote add origin ${REMOTE_URL}</button>`; return; }
  const bs = Object.keys(st.remote.branches).sort();
  el.innerHTML = `<p class="sub">${esc(st.remote.url)}</p>` + (bs.length ? `<div class="rbr">${bs.map(b => { const id = st.remote.branches[b]; return `<div><span><b>${esc(b)}</b> → ${id}</span><span style="color:var(--muted)">${esc(st.commits[id].msg)}</span></div>`; }).join("")}</div>` : `<p class="empty">Empty repository. Nothing pushed yet.</p>`)
    + `<div style="margin-top:10px"><button class="btn small" id="tmBtn" type="button">Simulate a teammate pushing to main</button></div>`;
  $("#tmBtn").onclick = teammate;
}
function renderEditor(){
  const el = $("#vEditor");
  if (!editing || !(editing in st.files)){ el.innerHTML = ""; editing = null; return; }
  if (el.dataset.f === editing && el.firstChild) return;
  el.dataset.f = editing;
  el.innerHTML = `<div class="editor"><label class="lab" for="edTa">Editing ${esc(editing)}</label><textarea id="edTa" spellcheck="false"></textarea><div class="row"><button class="btn small primary" id="edSave" type="button">Save file</button><button class="btn small" id="edClose" type="button">Close</button></div></div>`;
  $("#edTa").value = st.files[editing];
  $("#edSave").onclick = () => { let v = $("#edTa").value; if (v && !v.endsWith("\n")) v += "\n"; st.files[editing] = v; note(`Saved ${editing}. Saving only changes the working directory; Git hasn't recorded anything yet. Run git status to see.`); save(); el.dataset.f = ""; render(); out.scrollTop = out.scrollHeight; };
  $("#edClose").onclick = () => { editing = null; el.dataset.f = ""; render(); };
}
$("#vWork").addEventListener("click", e => { const b = e.target.closest(".fname"); if (!b) return; editing = b.dataset.f; $("#vEditor").dataset.f = ""; render(); $("#edTa")?.focus(); });

const TASKS = [
  ["Turn the folder into a repository", "git init", () => st.inited],
  ["Create a file", 'echo "Buy milk" > notes.txt', () => Object.keys(st.files).length > 0 || Object.keys(st.commits).length > 0],
  ["Check where your change is", "git status", () => st.flags.status],
  ["Stage the file", "git add notes.txt", () => Object.keys(st.index).length > 0],
  ["Make your first commit", 'git commit -m "Add notes"', () => Object.keys(st.commits).length > 0],
  ["Create and switch to a branch", "git switch -c eggs", () => Object.keys(st.branches).length > 1 || st.flags.branchCommit],
  ["Change the file and commit on the branch", 'echo "Buy eggs" >> notes.txt', () => st.flags.branchCommit, 'git commit -am "Add eggs"'],
  ["Go back to main and merge the branch", "git switch main", () => st.flags.merged, "git merge eggs"],
  ["Connect GitHub as a remote", `git remote add origin ${REMOTE_URL}`, () => !!st.remote],
  ["Push main to GitHub", "git push -u origin main", () => !!(st.remote && st.remote.branches.main)],
  ["Click “Simulate a teammate pushing,” then pull their work", "git pull", () => st.flags.pulled],
  ["Bonus: cause and resolve a merge conflict", null, () => st.flags.conflict && st.flags.resolved, null, {
    why: "A conflict happens when two branches change the same lines in different ways. Git can't choose for you, so it stops and asks. Here you'll set one up on purpose.",
    steps: [
      ["Start on main with everything committed. git status should say “working tree clean.”", ["git switch main", "git status"]],
      ["Create a branch for one version of the change.", ["git switch -c oat-milk"]],
      ["On that branch, replace the file's text and commit. The > overwrites the whole file, so the same lines change.", ['echo "Buy oat milk" > notes.txt', 'git commit -am "Switch to oat milk"']],
      ["Go back to main.", ["git switch main"]],
      ["Change the same lines in a different way on main, and commit.", ['echo "Buy whole milk" > notes.txt', 'git commit -am "Switch to whole milk"']],
      ["Merge the branch. You'll get a CONFLICT, and notes.txt shows a red “conflict” badge in Working directory.", ["git merge oat-milk"]],
      ["Click notes.txt in the Working directory panel. Delete the <<<<<<<, ======= and >>>>>>> lines, keep the text you want, then click Save file.", ["cat notes.txt"]],
      ["Mark the file as resolved and finish the merge.", ["git add notes.txt", 'git commit -m "Merge oat-milk"']],
      ["Look at the result: a merge commit with two parents.", ["git log --oneline --all"]],
    ],
    stuck: "Stuck partway through? git merge --abort cancels the merge and puts your files back. Reset sandbox (top of the terminal) starts over completely.",
  }],
];
let openHelp = new Set();
function renderTasks(){
  let nextSet = false;
  const hint = c => `<button class="hint" type="button" data-cmd="${esc(c)}">${esc(c)}</button>`;
  $("#tasks").innerHTML = TASKS.map(([t, cmd, ok, cmd2, help], i) => {
    const d = ok(); let cls = d ? "done" : ""; if (!d && !nextSet){ cls = "next"; nextSet = true; }
    let extra = "";
    if (help){
      extra = `<details class="howto" data-i="${i}"${openHelp.has(i) ? " open" : ""}><summary>Show me how</summary>
        <p>${esc(help.why)}</p>
        <ol>${help.steps.map(([txt, cmds]) => `<li>${esc(txt)}<span class="cmds">${cmds.map(hint).join("")}</span></li>`).join("")}</ol>
        <p class="stuck">${esc(help.stuck)} ${hint("git merge --abort")}</p></details>`;
    }
    return `<li class="${cls}"><span class="ck" aria-hidden="true"></span><span class="tx"><span class="tt">${esc(t)}</span>${cmd ? " " + hint(cmd) : ""}${cmd2 ? " " + hint(cmd2) : ""}${extra}</span></li>`;
  }).join("");
}
$("#tasks").addEventListener("toggle", e => {
  const dt = e.target; if (!dt.matches || !dt.matches("details.howto")) return;
  const i = +dt.dataset.i; dt.open ? openHelp.add(i) : openHelp.delete(i);
}, true);
document.addEventListener("click", e => { const h = e.target.closest(".hint"); if (!h) return; const i = $("#sbIn"); i.value = h.dataset.cmd; i.focus(); });

// history + submit
let hist = [], hi = 0;
$("#sbForm").addEventListener("submit", e => {
  e.preventDefault(); const v = $("#sbIn").value; $("#sbIn").value = "";
  if (v.trim()){ hist.push(v); hi = hist.length; }
  if (/^git\s+status\b/.test(v.trim())) st.flags.status = true;
  run(v);
});
$("#sbIn").addEventListener("keydown", e => {
  if (e.key === "ArrowUp" && hi > 0){ e.preventDefault(); hi--; e.target.value = hist[hi]; }
  else if (e.key === "ArrowDown"){ e.preventDefault(); hi = Math.min(hist.length, hi+1); e.target.value = hist[hi] || ""; }
});
$("#sbClear").onclick = () => { out.innerHTML = ""; };
let resetArmed = false;
$("#sbReset").onclick = e => {
  if (!resetArmed){ resetArmed = true; e.target.textContent = "click again to reset"; setTimeout(() => { resetArmed = false; e.target.textContent = "reset sandbox"; }, 2500); return; }
  resetArmed = false; e.target.textContent = "reset sandbox";
  st = fresh(); editing = null; out.innerHTML = ""; save(); welcome(); render();
};
function welcome(){
  note("Welcome. This terminal pretends to be a fresh, empty folder called project. Follow the guided exercise below, or type help. The panels on the right show where your changes live after every command.");
}

/* ---------------- Boot ---------------- */
buildNav(); renderGloss(); welcome(); render(); show();
