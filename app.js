const C = window.IDEA_BOARD;
const $ = id => document.getElementById(id);
const API = `https://api.github.com/repos/${C.repo}`;
let ideas = [], status = "", owner = "", me = null;
const open = new Set(), collapsed = new Set(), threads = {}, drafts = {};

// Replies are ordinary GitHub comments that start with a hidden marker, so the thread survives on GitHub too.
const REPLY = /<!--\s*reply-to:\s*(\d+)\s*-->/, ANALYSIS = /<!--\s*spark-lab:analysis\s*-->/;

document.title = $("title").textContent = C.title;
$("newIdea").href = `https://github.com/${C.repo}/issues/new/choose`;

const store = {
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} }
};
const token = () => store.get("ghToken");

async function gh(path, opts = {}) {
  const headers = { Accept: "application/vnd.github.full+json", ...(opts.body ? { "Content-Type": "application/json" } : {}) };
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const res = await fetch(path.startsWith("http") ? path : API + path, { ...opts, headers });
  if (!res.ok) throw new Error(res.status === 401 ? "GitHub token rejected. Connect again." : res.status === 403 ? "GitHub rate limit or permission problem (connect a token)" : res.status === 404 ? "Repo not found (check config.js, and that it is public)" : "GitHub API error " + res.status);
  return res.status === 204 ? null : res.json();
}

const statusOf = i => {
  const l = i.labels.map(l => l.name.replace(/^status:\s*/, ""));
  return i.state === "closed" ? "done" : C.statuses.find(s => l.includes(s)) || "spark";
};

const demo = () => {
  const u = n => ({ login: n, avatar_url: `https://github.com/${n}.png?` });
  const d = (title, labels, who, comments, state = "open") => ({
    title, body_html: "<p>Sample description for this idea.</p>", state, comments, html_url: "#", updated_at: new Date().toISOString(),
    labels: labels.map(name => ({ name })), assignees: who.map(u)
  });
  return [
    d("Habit tracker with friends", ["status:spark"], [], 0),
    d("Offline-first recipe app", ["status:exploring"], ["me"], 3),
    d("Tiny CLI for meeting notes", ["status:building"], ["friend"], 5),
    d("Personal landing page", [], ["me"], 2, "closed")
  ];
};

function authBar() {
  $("auth").innerHTML = me
    ? `<span class="who"><img src="${me.avatar_url}&s=36" alt="">${esc(me.login)}</span> <button id="logout" class="link">disconnect</button>`
    : `<button id="login" class="link">Connect GitHub to reply</button>`;
  if (me) $("logout").onclick = () => { store.set("ghToken", null); me = null; authBar(); render(); };
  else $("login").onclick = connect;
}

async function connect() {
  const t = prompt("Paste a GitHub fine-grained token with Issues: Read and write on " + C.repo + ".\nIt is kept only in this browser.");
  if (!t) return;
  store.set("ghToken", t.trim());
  try { me = await gh("https://api.github.com/user"); } catch (e) { store.set("ghToken", null); me = null; alert(e.message); }
  authBar(); render();
}

async function load() {
  if (C.repo.startsWith("YOUR-")) {
    $("list").insertAdjacentHTML("beforebegin", `<p class="muted">Demo data. Set <code>repo</code> in config.js to use real issues.</p>`);
    ideas = demo();
    const owners = [...new Set(ideas.flatMap(i => i.assignees.map(a => a.login)))];
    $("ownerFilter").innerHTML = `<option value="">Everyone</option>` + owners.map(o => `<option>${o}</option>`).join("");
    return render();
  }
  if (token()) { try { me = await gh("https://api.github.com/user"); } catch { me = null; } }
  authBar();
  try {
    ideas = (await gh("/issues?state=all&per_page=100")).filter(i => !i.pull_request);
  } catch (e) {
    $("list").innerHTML = `<p class="muted">${e.message}</p>`;
    return;
  }
  const owners = [...new Set(ideas.flatMap(i => i.assignees.map(a => a.login)))];
  $("ownerFilter").innerHTML = `<option value="">Everyone</option>` + owners.map(o => `<option>${o}</option>`).join("");
  render();
}

async function loadThread(n) {
  threads[n] = { loading: true };
  try {
    const list = [];
    for (let p = 1; ; p++) {
      const page = await gh(`/issues/${n}/comments?per_page=100&page=${p}`);
      list.push(...page);
      if (page.length < 100) break;
    }
    threads[n] = { list };
  } catch (e) {
    threads[n] = { error: e.message };
  }
  paintThread(n);
}

function filters() {
  const el = $("statusFilters");
  el.innerHTML = ["", ...C.statuses].map(s => `<button data-s="${s}" class="${s === status ? "on" : ""}">${s || "all"}</button>`).join(" ");
  el.querySelectorAll("button").forEach(b => b.onclick = () => { status = b.dataset.s; render(); });
}

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

function ago(d) {
  const s = (Date.now() - new Date(d)) / 1000;
  for (const [n, u] of [[31536000, "y"], [2592000, "mo"], [86400, "d"], [3600, "h"], [60, "m"]]) if (s >= n) return Math.floor(s / n) + u + " ago";
  return "just now";
}

// Turn the flat GitHub comment list into a tree. A reply whose parent was deleted becomes top-level.
function tree(list) {
  const byId = new Map(list.map(c => [c.id, { c, kids: [], parent: +(c.body?.match(REPLY)?.[1] || 0), analysis: ANALYSIS.test(c.body || "") }]));
  const roots = [];
  for (const node of byId.values()) (byId.get(node.parent)?.kids || roots).push(node);
  const ups = n => n.c.reactions?.["+1"] || 0;
  roots.sort((a, b) => b.analysis - a.analysis || ups(b) - ups(a) || new Date(a.c.created_at) - new Date(b.c.created_at));
  return roots;
}

function bodyOf(node) {
  const d = document.createElement("div");
  d.innerHTML = node.c.body_html || "";
  // drop the "↪ replying to" quote that reply comments carry for readers on GitHub
  if (node.parent) { const q = d.querySelector("blockquote"); if (q && q.textContent.includes("↪")) q.remove(); }
  return d.innerHTML;
}

function commentHtml(node, n, depth) {
  const c = node.c, id = c.id, shut = collapsed.has(id);
  const count = (x => x.kids.reduce((s, k) => s + 1 + count(k), 0));
  const author = node.analysis
    ? `<span class="who bot">🤖 Claude</span><span class="tag">VC review</span>`
    : `<span class="who"><img src="${c.user.avatar_url}&s=36" alt="">${esc(c.user.login)}</span>`;
  return `<div class="cmt${node.analysis ? " analysis" : ""}" data-c="${id}">
    <div class="chead">
      <button class="fold" data-fold="${id}" aria-label="${shut ? "Expand" : "Collapse"}">[${shut ? "+" : "–"}]</button>
      ${author}<span class="muted">${ago(c.created_at)}</span>
      ${shut ? `<span class="muted">${count(node) ? count(node) + " repl" + (count(node) > 1 ? "ies" : "y") + " hidden" : "collapsed"}</span>` : ""}
    </div>
    ${shut ? "" : `<div class="cbody">${bodyOf(node)}</div>
    <div class="cacts">
      <button class="link" data-up="${id}">▲ ${c.reactions?.["+1"] || 0}</button>
      <button class="link" data-reply="${id}">Reply</button>
      <a class="link" href="${c.html_url}" target="_blank" rel="noopener">GitHub ↗</a>
    </div>
    ${drafts[id] != null ? replyBox(n, id) : ""}
    ${node.kids.length ? `<div class="kids">${node.kids.map(k => commentHtml(k, n, depth + 1)).join("")}</div>` : ""}`}
  </div>`;
}

const draftKey = (n, parent) => parent || "top" + n;

function replyBox(n, parent) {
  return `<form class="reply" data-n="${n}" data-parent="${parent}">
    <textarea rows="${parent ? 3 : 2}" placeholder="${parent ? "Write a reply… (Markdown works)" : "Add a comment…"}">${esc(drafts[draftKey(n, parent)] || "")}</textarea>
    <div class="ractions">
      ${parent ? `<button type="button" class="link" data-cancel="${parent}">Cancel</button>` : ""}
      <button type="submit" class="btn small">${parent ? "Reply" : "Comment"}</button>
    </div>
  </form>`;
}

function threadHtml(n) {
  const t = threads[n];
  if (!t || t.loading) return `<p class="muted">Loading comments…</p>`;
  if (t.error) return `<p class="muted">${esc(t.error)}</p>`;
  const roots = tree(t.list);
  return `<h3 class="thead">${t.list.length} comment${t.list.length === 1 ? "" : "s"}</h3>
    ${roots.map(r => commentHtml(r, n, 0)).join("") || `<p class="muted">No comments yet.</p>`}
    ${replyBox(n, 0)}`;
}

function paintThread(n) {
  const el = document.querySelector(`.thread[data-n="${n}"]`);
  if (el) el.innerHTML = threadHtml(n);
}

function render() {
  filters();
  const q = $("search").value.toLowerCase();
  const rows = ideas.filter(i =>
    (!status || statusOf(i) === status) &&
    (!owner || i.assignees.some(a => a.login === owner)) &&
    (!q || (i.title + " " + (i.body_html || "").replace(/<[^>]+>/g, " ")).toLowerCase().includes(q)));
  $("list").innerHTML = rows.length ? rows.map(i => {
    const s = statusOf(i);
    const who = i.assignees.length
      ? i.assignees.map(a => `<span class="who"><img src="${a.avatar_url}&s=36" alt="">${esc(a.login)}</span>`).join("")
      : `<span>unclaimed</span>`;
    return `<details class="card" data-id="${i.number ?? i.title}"${open.has(String(i.number ?? i.title)) ? " open" : ""}>
      <summary>
        <h2>${esc(i.title)}</h2>
        <div class="meta"><span class="badge ${s}">${s}</span>${who}<span>💬 ${i.comments}</span><span>${new Date(i.updated_at).toLocaleDateString()}</span></div>
      </summary>
      <div class="body">${i.body_html || '<p class="muted">No description.</p>'}
        <p><a href="${i.html_url}" target="_blank" rel="noopener">Open on GitHub ↗</a></p>
        ${i.number ? `<div class="thread" data-n="${i.number}">${threadHtml(i.number)}</div>` : ""}</div>
    </details>`;
  }).join("") : `<p class="muted">No ideas match.</p>`;
  for (const n of open) if (threads[n] === undefined && ideas.some(i => String(i.number) === n)) loadThread(+n);
}

async function post(n, parent, text) {
  let body = text;
  if (parent) {
    const p = threads[n].list.find(c => c.id === parent);
    const who = p && ANALYSIS.test(p.body || "") ? "Claude" : "@" + p?.user.login;
    body = `<!-- reply-to: ${parent} -->\n> ↪ replying to ${who}\n\n${text}`;
  }
  await gh(`/issues/${n}/comments`, { method: "POST", body: JSON.stringify({ body }) });
  delete drafts[draftKey(n, parent)];
  const idea = ideas.find(i => i.number === n);
  if (idea) idea.comments++;
  await loadThread(n);
}

$("list").addEventListener("toggle", e => {
  const id = e.target.dataset?.id;
  if (!id) return;
  e.target.open ? open.add(id) : open.delete(id);
  if (e.target.open && threads[id] === undefined && /^\d+$/.test(id)) loadThread(+id);
}, true);

$("list").addEventListener("click", async e => {
  const b = e.target.closest("button");
  if (!b) return;
  const n = +b.closest(".thread")?.dataset.n;
  if (b.dataset.fold) {
    const id = +b.dataset.fold;
    collapsed.has(id) ? collapsed.delete(id) : collapsed.add(id);
    paintThread(n);
  } else if (b.dataset.reply) {
    if (!me) return connect();
    drafts[+b.dataset.reply] ??= "";
    paintThread(n);
    document.querySelector(`.reply[data-parent="${b.dataset.reply}"] textarea`)?.focus();
  } else if (b.dataset.cancel) {
    delete drafts[+b.dataset.cancel];
    paintThread(n);
  } else if (b.dataset.up) {
    if (!me) return connect();
    const id = +b.dataset.up;
    try {
      const res = await fetch(`${API}/issues/comments/${id}/reactions`, {
        method: "POST", body: JSON.stringify({ content: "+1" }),
        headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token()}` }
      });
      if (res.status === 201) {
        const c = threads[n].list.find(c => c.id === id);
        c.reactions = { ...c.reactions, "+1": (c.reactions?.["+1"] || 0) + 1 };
        paintThread(n);
      } else if (!res.ok) throw new Error("Upvote failed (" + res.status + ")");
    } catch (err) { alert(err.message); }
  }
});

$("list").addEventListener("input", e => {
  const f = e.target.closest(".reply");
  if (f) drafts[draftKey(+f.dataset.n, +f.dataset.parent)] = e.target.value;
});

$("list").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target, text = f.querySelector("textarea").value.trim();
  if (!text) return;
  if (!me) return connect();
  f.querySelector("[type=submit]").disabled = true;
  try { await post(+f.dataset.n, +f.dataset.parent, text); }
  catch (err) { alert(err.message); f.querySelector("[type=submit]").disabled = false; }
});

$("search").oninput = render;
$("ownerFilter").onchange = e => { owner = e.target.value; render(); };
filters();
load();
