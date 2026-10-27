const C = window.IDEA_BOARD;
const $ = id => document.getElementById(id);
const API = `https://api.github.com/repos/${C.repo}`;
let ideas = [], status = "", owner = "", me = null;
const open = new Set(), collapsed = new Set(), unclamped = new Set(), hiddenThreads = new Set(), threads = {}, drafts = {};
const LONG = 600; // characters of text before a comment starts as a preview

// Replies are ordinary GitHub comments that start with a hidden marker, so the thread survives on GitHub too.
const REPLY = /<!--\s*reply-to:\s*(\d+)\s*-->/, ANALYSIS = /<!--\s*spark-lab:analysis\s*-->/;

const svg = d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const I = {
  up: svg('<path d="M12 5 5 13h4.5v6h5v-6H19z"/>'),
  reply: svg('<path d="M10 8 5 12.5l5 4.5"/><path d="M5.5 12.5H14a5 5 0 0 1 5 5V19"/>'),
  ext: svg('<path d="M14 5h5v5"/><path d="m19 5-8 8"/><path d="M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/>'),
  chat: svg('<path d="M5 18.5V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H8z"/>'),
  chev: svg('<path d="m9 6 6 6-6 6"/>'),
  gh: '<svg viewBox="0 0 16 16" aria-hidden="true" class="fill"><path d="M8 0a8 8 0 0 0-2.5 15.6c.4 0 .5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.4.7 0-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.5 7.5 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.8-3.6 4 .3.3.6.8.6 1.5v2.2c0 .2.1.5.6.4A8 8 0 0 0 8 0z"/></svg>'
};

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
    ? `<span class="user-pill"><img src="${me.avatar_url}&s=48" alt="">${esc(me.login)}<button id="logout" class="x" title="Disconnect" aria-label="Disconnect GitHub">×</button></span>`
    : `<button id="login" class="btn ghost">${I.gh} Connect GitHub</button>`;
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

function owners() {
  const list = [...new Set(ideas.flatMap(i => i.assignees.map(a => a.login)))];
  $("ownerFilter").innerHTML = `<option value="">Everyone</option>` + list.map(o => `<option>${esc(o)}</option>`).join("");
}

async function load() {
  if (C.repo.startsWith("YOUR-")) {
    $("list").insertAdjacentHTML("beforebegin", `<p class="muted note">Demo data. Set <code>repo</code> in config.js to use real issues.</p>`);
    ideas = demo();
    owners();
    return render();
  }
  if (token()) { try { me = await gh("https://api.github.com/user"); } catch { me = null; } }
  authBar();
  try {
    ideas = (await gh("/issues?state=all&per_page=100")).filter(i => !i.pull_request);
  } catch (e) {
    $("list").innerHTML = `<p class="empty">${esc(e.message)}</p>`;
    return;
  }
  owners();
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
  const count = s => s ? ideas.filter(i => statusOf(i) === s).length : ideas.length;
  $("statusFilters").innerHTML = ["", ...C.statuses].map(s =>
    `<button data-s="${s}" class="${s === status ? "on" : ""}" aria-pressed="${s === status}">${s ? `<i class="dot ${s}"></i>` : ""}${s || "All"}<span class="n">${count(s)}</span></button>`).join("");
  $("statusFilters").querySelectorAll("button").forEach(b => b.onclick = () => { status = b.dataset.s; render(); });
  const building = count("building");
  $("tagline").textContent = ideas.length ? `${ideas.length} ideas · ${building} building · ${count("done")} shipped` : "Ideas worth chasing";
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

const count = node => node.kids.reduce((s, k) => s + 1 + count(k), 0);

function commentHtml(node, n) {
  const c = node.c, id = c.id, shut = collapsed.has(id), kids = count(node);
  const long = (c.body_text || c.body || "").length > LONG, clamp = long && !unclamped.has(id);
  const author = node.analysis
    ? `<span class="av bot" aria-hidden="true">🤖</span><b>Claude</b><span class="tag">VC review</span>`
    : `<img class="av" src="${c.user.avatar_url}&s=48" alt=""><b>${esc(c.user.login)}</b>`;
  return `<div class="cmt${node.analysis ? " analysis" : ""}${shut ? " shut" : ""}" data-c="${id}">
    <div class="chead" data-fold="${id}" title="${shut ? "Expand" : "Collapse"}">
      ${author}<span class="time">${ago(c.created_at)}</span>
      ${shut && kids ? `<span class="hidden-n">+${kids} repl${kids > 1 ? "ies" : "y"}</span>` : ""}
      <button class="fold" data-fold="${id}" aria-expanded="${!shut}" aria-label="${shut ? "Expand" : "Collapse"} comment">${shut ? "+" : "−"}</button>
    </div>
    ${shut ? "" : `<div class="cbody${clamp ? " clamp" : ""}">${bodyOf(node)}</div>
    ${long ? `<button class="more" data-more="${id}">${clamp ? "Read full review" : "Show less"} <span class="caret${clamp ? "" : " up"}">${I.chev}</span></button>` : ""}
    <div class="cacts">
      <button class="act vote" data-up="${id}" title="Upvote">${I.up}<b>${c.reactions?.["+1"] || 0}</b></button>
      <button class="act" data-reply="${id}">${I.reply}Reply</button>
      <a class="act" href="${c.html_url}" target="_blank" rel="noopener">${I.ext}GitHub</a>
    </div>
    ${drafts[id] != null ? replyBox(n, id) : ""}
    ${node.kids.length ? `<div class="kids">${node.kids.map(k => commentHtml(k, n)).join("")}</div>` : ""}`}
  </div>`;
}

const draftKey = (n, parent) => parent || "top" + n;

function replyBox(n, parent) {
  return `<form class="reply${parent ? "" : " top"}" data-n="${n}" data-parent="${parent}">
    ${parent ? "" : me ? `<img class="av" src="${me.avatar_url}&s=48" alt="">` : `<span class="av blank" aria-hidden="true">${I.chat}</span>`}
    <div class="rbox">
      <textarea rows="${parent ? 3 : 2}" placeholder="${parent ? "Write a reply… (Markdown works)" : me ? "Add to the discussion…" : "Connect GitHub to join the discussion…"}">${esc(drafts[draftKey(n, parent)] || "")}</textarea>
      <div class="ractions">
        ${parent ? `<button type="button" class="btn ghost sm" data-cancel="${parent}">Cancel</button>` : ""}
        <button type="submit" class="btn primary sm">${parent ? "Reply" : "Comment"}</button>
      </div>
    </div>
  </form>`;
}

function threadHtml(n) {
  const t = threads[n];
  if (!t || t.loading) return `<div class="skeleton sm"></div><div class="skeleton sm"></div>`;
  if (t.error) return `<p class="empty">${esc(t.error)}</p>`;
  const roots = tree(t.list), hid = hiddenThreads.has(String(n));
  return `<button class="thead" data-thread="${n}" aria-expanded="${!hid}">
      ${I.chat}<span>Discussion</span><span class="n">${t.list.length}</span><span class="caret${hid ? "" : " down"}">${I.chev}</span>
    </button>
    ${hid ? "" : `<div class="comments">${roots.map(r => commentHtml(r, n)).join("") || `<p class="muted quiet">No comments yet. Start the discussion.</p>`}</div>
    ${replyBox(n, 0)}`}`;
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
      ? `<span class="stack">${i.assignees.map(a => `<img src="${a.avatar_url}&s=48" alt="${esc(a.login)}" title="${esc(a.login)}">`).join("")}</span>`
      : `<span class="unclaimed">Unclaimed</span>`;
    return `<details class="card s-${s}" data-id="${i.number ?? i.title}"${open.has(String(i.number ?? i.title)) ? " open" : ""}>
      <summary>
        <div class="ctop">
          ${i.number ? `<span class="num">#${i.number}</span>` : ""}
          <span class="badge ${s}"><i class="dot ${s}"></i>${s}</span>
          <span class="chev">${I.chev}</span>
        </div>
        <h2>${esc(i.title)}</h2>
        <div class="meta">${who}<span class="mi">${I.chat}${i.comments}</span><span class="mi">${ago(i.updated_at)}</span></div>
      </summary>
      <div class="body">
        <div class="desc">${i.body_html || '<p class="muted">No description.</p>'}</div>
        <a class="btn ghost sm" href="${i.html_url}" target="_blank" rel="noopener">${I.gh} Open issue</a>
        ${i.number ? `<section class="thread" data-n="${i.number}">${threadHtml(i.number)}</section>` : ""}
      </div>
    </details>`;
  }).join("") : `<p class="empty">No ideas match. Try another filter.</p>`;
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
  if (e.target.closest("a")) return;
  const b = e.target.closest("button, .chead");
  if (!b) return;
  const n = +b.closest(".thread")?.dataset.n;
  if (b.dataset.thread) {
    const k = b.dataset.thread;
    hiddenThreads.has(k) ? hiddenThreads.delete(k) : hiddenThreads.add(k);
    paintThread(n);
  } else if (b.dataset.more) {
    const id = +b.dataset.more;
    unclamped.has(id) ? unclamped.delete(id) : unclamped.add(id);
    paintThread(n);
  } else if (b.dataset.fold) {
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
  if (!me) return connect();
  if (!text) return;
  f.querySelector("[type=submit]").disabled = true;
  try { await post(+f.dataset.n, +f.dataset.parent, text); }
  catch (err) { alert(err.message); f.querySelector("[type=submit]").disabled = false; }
});

$("search").oninput = render;
$("ownerFilter").onchange = e => { owner = e.target.value; render(); };
filters();
load();
