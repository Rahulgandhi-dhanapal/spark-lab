const C = window.IDEA_BOARD;
const $ = id => document.getElementById(id);
let ideas = [], status = "", owner = "";
const open = new Set();

document.title = $("title").textContent = C.title;
$("newIdea").href = `https://github.com/${C.repo}/issues/new/choose`;

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

async function load() {
  if (C.repo.startsWith("YOUR-")) {
    $("list").insertAdjacentHTML("beforebegin", `<p class="muted">Demo data. Set <code>repo</code> in config.js to use real issues.</p>`);
    ideas = demo();
    const owners = [...new Set(ideas.flatMap(i => i.assignees.map(a => a.login)))];
    $("ownerFilter").innerHTML = `<option value="">Everyone</option>` + owners.map(o => `<option>${o}</option>`).join("");
    return render();
  }
  try {
    const res = await fetch(`https://api.github.com/repos/${C.repo}/issues?state=all&per_page=100`, { headers: { Accept: "application/vnd.github.html+json" } });
    if (!res.ok) throw new Error(res.status === 404 ? "Repo not found (check config.js, and that it is public)" : "GitHub API error " + res.status);
    ideas = (await res.json()).filter(i => !i.pull_request);
  } catch (e) {
    $("list").innerHTML = `<p class="muted">${e.message}</p>`;
    return;
  }
  const owners = [...new Set(ideas.flatMap(i => i.assignees.map(a => a.login)))];
  $("ownerFilter").innerHTML = `<option value="">Everyone</option>` + owners.map(o => `<option>${o}</option>`).join("");
  render();
}

function filters() {
  const el = $("statusFilters");
  el.innerHTML = ["", ...C.statuses].map(s => `<button data-s="${s}" class="${s === status ? "on" : ""}">${s || "all"}</button>`).join(" ");
  el.querySelectorAll("button").forEach(b => b.onclick = () => { status = b.dataset.s; render(); });
}

function esc(s) { return s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

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
        <p><a href="${i.html_url}" target="_blank" rel="noopener">Open on GitHub / comment ↗</a></p></div>
    </details>`;
  }).join("") : `<p class="muted">No ideas match.</p>`;
}

$("list").addEventListener("toggle", e => {
  const id = e.target.dataset?.id;
  if (id) e.target.open ? open.add(id) : open.delete(id);
}, true);
$("search").oninput = render;
$("ownerFilter").onchange = e => { owner = e.target.value; render(); };
filters();
load();
