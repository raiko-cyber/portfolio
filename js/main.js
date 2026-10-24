(() => {
  const C = window.CONFIG, D = window.I18N, $ = id => document.getElementById(id);
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  let lang = /^kk/.test(navigator.language) ? "kk" : /^en/.test(navigator.language) ? "en" : "ru"; try { const sv = localStorage.getItem("lang"); if (sv && Object.prototype.hasOwnProperty.call(D, sv)) lang = sv; } catch {}
  const safe = (u, re) => (typeof u === "string" && re.test(u) ? u : "#"), HTTPS = /^https:\/\//, GHURL = /^https:\/\/github\.com\//, AVA = /^https:\/\/avatars\.githubusercontent\.com\//;
  const enc = encodeURIComponent;
  const t = k => D[lang][k];
  let gh = null, ghErr = null, tt;
  const toast = m => { const x = $("toast"); x.textContent = m; x.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => x.classList.remove("show"), 2800); };

  /* ---- public link ---- */
  const publicUrl = () => { if (C.siteUrl) return C.siteUrl; const h = location.hostname; return location.protocol.startsWith("http") && h && !["localhost", "127.0.0.1"].includes(h) ? location.href.split("#")[0] : ""; };
  async function copyLink() {
    const u = publicUrl(); if (!u) return toast(t("noUrl"));
    try { await navigator.clipboard.writeText(u); } catch { const a = el("textarea"); a.value = u; document.body.appendChild(a); a.select(); document.execCommand("copy"); a.remove(); }
    toast(t("copied"));
  }

  /* ---- cards ---- */
  function card(it, link) {
    const c = el(link ? "a" : "div", "card" + (link ? " link" : "")); if (link) { c.href = link; c.target = "_blank"; c.rel = "noopener"; }
    if (it.tag) c.appendChild(el("span", "tag", it.tag));
    c.appendChild(el("h3", "", it.title));
    const m = [it.place, it.period].filter(Boolean).join(" · "); if (m) c.appendChild(el("p", "", m));
    if (it.text || it.note) c.appendChild(el("p", "", it.text || it.note));
    return c;
  }
  const contacts = () => [
    [t("phone"), C.phone, C.phone && "tel:" + C.phone.replace(/[^+\d]/g, "")],
    ["Email", C.email, C.email && "mailto:" + C.email],
    ["Telegram", C.telegram && "@" + C.telegram, C.telegram && "https://t.me/" + enc(C.telegram)],
    ["Instagram", C.instagram && "@" + C.instagram, C.instagram && "https://instagram.com/" + enc(C.instagram)],
    ["LinkedIn", C.linkedin && "LinkedIn", C.linkedin && safe(C.linkedin, HTTPS)],
    ["GitHub", C.githubUsername && "@" + C.githubUsername, C.githubUsername && "https://github.com/" + enc(C.githubUsername)]];
  const edu = () => [...C.education, ...C.courses];

  function renderStatic() {
    document.documentElement.lang = lang;
    const nm = t("name").split(" "), hn = $("heroName"); hn.textContent = nm[0]; hn.appendChild(document.createElement("br")); hn.appendChild(document.createTextNode(nm.slice(1).join(" ")));
    document.title = t("name") + " — Portfolio"; $("fname").textContent = t("name");
    document.querySelectorAll("[data-i18n]").forEach(n => n.textContent = t(n.dataset.i18n));
    document.querySelectorAll("#lang button").forEach(b => b.setAttribute("aria-pressed", b.dataset.l === lang));
    const st = $("student"); st.textContent = t("a3") + (C.university ? " — " + C.university : ""); 
    $("chips").textContent = ""; t("chips").forEach(x => $("chips").appendChild(el("li", "", x)));
    $("projectGrid").textContent = ""; t("projects").forEach((p, i) => $("projectGrid").appendChild(card({ title: p[0], tag: p[1], text: p[2] }, C.projectLinks[i])));
    $("eduGrid").textContent = ""; edu().length ? edu().forEach(e => $("eduGrid").appendChild(card(e))) : $("eduGrid").appendChild(el("div", "card empty", t("eduEmpty")));
    $("contactGrid").textContent = ""; contacts().forEach(([l, tx, href]) => {
      const c = el("div", "card" + (tx ? "" : " empty")); c.appendChild(el("span", "tag", l));
      if (tx) { const a = el("a", "", tx); a.href = href; if (href.startsWith("http")) { a.target = "_blank"; a.rel = "noopener"; } const h = el("h3"); h.appendChild(a); c.appendChild(h); } else c.appendChild(el("p", "", t("add")));
      $("contactGrid").appendChild(c); });
    $("miles").textContent = ""; t("milestones").forEach(m => $("miles").appendChild(el("li", "", m)));
    renderQr(); renderGh(); $("btnCv").textContent = t("cv");
  }

  /* ---- QR ---- */
  function renderQr() {
    const u = publicUrl(), box = $("qrCanvas"); box.textContent = ""; $("qrDl").disabled = !u;
    if (!u) { $("qrMsg").textContent = t("noUrl"); return; }
    $("qrMsg").textContent = t("qrOk") + " " + u;
    if (typeof QRCode === "undefined") { $("qrMsg").textContent = t("qrLib"); return; }
    new QRCode(box, { text: u, width: 190, height: 190, colorDark: "#6F4E37", colorLight: "#E5E4E2", correctLevel: QRCode.CorrectLevel.H });
  }
  $("qrDl").onclick = () => { const cv = $("qrCanvas").querySelector("canvas"); if (!cv) return toast(t("noUrl")); const a = el("a"); a.href = cv.toDataURL("image/png"); a.download = "portfolio-qr.png"; a.click(); };

  /* ---- CV ---- */
  function buildCv() {
    const cv = $("cv"); cv.textContent = "";
    const add = (par, tag, cls, txt) => { const e = el(tag, cls, txt); par.appendChild(e); return e; };
    const head = add(cv, "header", "cv-h"); add(head, "h1", "", t("name")); if (lang !== "en") add(head, "p", "cv-lat", C.nameLatin);
    add(head, "p", "cv-tag", t("a3") + (C.university ? " — " + C.university : ""));
    const body = add(cv, "div", "cv-b"), side = add(body, "aside"), main = add(body, "section");
    const block = (par, title, items, plain) => { if (!items.length) return; const d = add(par, "div", "cv-s"); add(d, "h2", "", title); const ul = add(d, "ul", plain ? "plain" : ""); items.forEach(i => add(ul, "li", "", i)); };
    const about = add(side, "div", "cv-s"); add(about, "h2", "", t("aboutT")); add(about, "p", "", t("a1")); add(about, "p", "", t("a2"));
    block(side, t("cvC"), contacts().filter(c => c[1]).map(c => c[0] + ": " + c[1]), true);
    const u = publicUrl(), qc = $("qrCanvas").querySelector("canvas");
    if (u && qc) { const d = add(side, "div", "cv-s cv-qr"); add(d, "h2", "", "QR"); const im = add(d, "img"); im.src = qc.toDataURL("image/png"); im.alt = "QR"; add(d, "small", "", u); }
    block(main, t("cvE"), edu().map(e => [e.title, e.place, e.period, e.note].filter(Boolean).join(" · ")));
    const pj = add(main, "div", "cv-s"); add(pj, "h2", "", t("cvP")); t("projects").forEach(p => { const x = add(pj, "div", "cv-p"); add(x, "b", "", p[0]); add(x, "span", "", p[1]); add(x, "p", "", p[2]); });
    const it = add(main, "div", "cv-s"); add(it, "h2", "", t("cvI")); const ch = add(it, "div", "cv-chips"); t("chips").forEach(c => add(ch, "span", "", c));
    block(main, t("cvM"), t("milestones"));
    if (C.githubUsername) block(main, "GitHub", ["github.com/" + C.githubUsername], true);
  }
  $("btnCv").onclick = () => { buildCv(); toast(t("cvHint")); setTimeout(() => window.print(), 700); };
  $("btnCopy").onclick = copyLink; $("qrCopy").onclick = copyLink;

  const ph = document.querySelector(".portrait img"); if (ph) { const gone = () => ph.remove(); ph.addEventListener("error", gone); if (ph.complete && !ph.naturalWidth) gone(); }

  /* ---- menu + language ---- */
  const burger = $("burger"), menu = $("menu");
  burger.onclick = () => { const o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); };
  menu.querySelectorAll("a").forEach(a => a.onclick = () => { menu.classList.remove("open"); burger.setAttribute("aria-expanded", false); });
  document.querySelectorAll("#lang button").forEach(b => b.onclick = () => { lang = b.dataset.l; try { localStorage.setItem("lang", lang); } catch {} renderStatic(); });
  const links = [...menu.querySelectorAll("a")], secs = links.map(a => document.querySelector(a.getAttribute("href")));
  if ("IntersectionObserver" in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((a, i) => a.classList.toggle("on", secs[i] === e.target)); }), { rootMargin: "-45% 0px -50% 0px" }); secs.forEach(x => x && io.observe(x)); }
  $("year").textContent = new Date().getFullYear();

  /* ---- GitHub ---- */
  const U = (C.githubUsername || "").trim(), API = "https://api.github.com", state = $("ghState");
  const ago = d => { const s = (Date.now() - new Date(d)) / 1000, a = t("ago"); return s < 3600 ? Math.max(1, s / 60 | 0) + " " + a[0] : s < 86400 ? (s / 3600 | 0) + " " + a[1] : (s / 86400 | 0) + " " + a[2]; };
  async function j(url) { const r = await fetch(url, { headers: { Accept: "application/vnd.github+json" } }); if (r.status === 404) throw new Error("NF"); if (r.status === 403 || r.status === 429) throw new Error("RL"); if (!r.ok) throw new Error("E"); return r.json(); }
  const link = (a, txt, href) => { a.textContent = txt; a.href = href; a.target = "_blank"; a.rel = "noopener"; return a; };

  function renderGh() {
    $("ghAch").textContent = "Achievements";
    if (!U) { state.hidden = false; state.textContent = t("ghSet"); $("ghBody").hidden = true; return; }
    if (ghErr) { state.hidden = false; state.textContent = t(ghErr) + " "; state.appendChild(link(el("a"), t("ghOpen"), "https://github.com/" + U)); $("ghBody").hidden = true; return; }
    if (!gh) return;
    const { u, repos, graph, events } = gh; state.hidden = true; $("ghBody").hidden = false;
    $("ghAvatar").src = safe(u.avatar_url, AVA); $("ghName").textContent = u.name || u.login; $("ghLogin").textContent = "@" + u.login; $("ghBio").textContent = u.bio || ""; $("ghLink").href = safe(u.html_url, GHURL); $("ghAch").href = safe(u.html_url, GHURL) + "?tab=achievements";
    const own = repos.filter(r => !r.fork), stars = own.reduce((s, r) => s + r.stargazers_count, 0);
    const v = [u.public_repos, u.followers, u.following, stars, u.public_gists, new Date(u.created_at).getFullYear()];
    $("ghStats").textContent = ""; t("st").forEach((l, i) => { const d = el("div", "stat"); d.appendChild(el("b", "", v[i])); d.appendChild(el("span", "", l)); $("ghStats").appendChild(d); });
    const list = C.pinnedRepos.length ? C.pinnedRepos.map(n => repos.find(r => r.name.toLowerCase() === n.toLowerCase())).filter(Boolean) : [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at)).slice(0, 6);
    const box = $("ghRepos"); box.textContent = ""; if (!list.length) box.appendChild(el("div", "card empty", t("noRepo")));
    list.forEach(r => { const c = el("a", "card link"); c.href = safe(r.html_url, GHURL); c.target = "_blank"; c.rel = "noopener"; c.appendChild(el("span", "tag", r.language || "—")); c.appendChild(el("h3", "", r.name)); c.appendChild(el("p", "", r.description || t("noDesc"))); c.appendChild(el("p", "", "★ " + r.stargazers_count)); box.appendChild(c); });
    const g = $("ghGraph"), gm = $("ghGraphMsg"); g.textContent = "";
    if (graph && graph.length) { const pad = new Date(graph[0].date).getUTCDay(); for (let i = 0; i < pad; i++) g.appendChild(el("i")).style.visibility = "hidden"; graph.forEach(x => { const i = el("i"); i.dataset.l = String(x.level | 0).slice(0, 1); i.title = x.date + ": " + x.count; g.appendChild(i); }); gm.textContent = graph.reduce((s, x) => s + x.count, 0) + " " + t("graphTotal"); } else gm.textContent = t("graphFail");
    const f = $("ghFeed"); f.textContent = "";
    if (!events) f.appendChild(el("li", "", t("evFail"))); else if (!events.length) f.appendChild(el("li", "", t("noEv"))); else events.forEach(e => { const li = el("li"); let x = e.type.replace("Event", ""); if (e.type === "PushEvent") x = t("push") + ": " + ((e.payload.commits || []).length || 1); else if (e.type === "CreateEvent") x = t("created") + ": " + (e.payload.ref_type || ""); else if (e.type === "WatchEvent") x = t("star"); li.appendChild(el("b", "", x)); li.append(" · " + e.repo.name + " · " + ago(e.created_at)); f.appendChild(li); });
    $("ghUpd").textContent = t("ghUpd") + " " + new Date().toLocaleTimeString(lang === "kk" ? "kk-KZ" : lang === "en" ? "en-GB" : "ru-RU");
  }

  async function loadGh(first) {
    if (!U) return renderGh();
    if (first) { state.hidden = false; state.textContent = ""; for (let i = 0; i < 3; i++) state.appendChild(el("div", "skel")); }
    try {
      const [u, repos] = await Promise.all([j(`${API}/users/${enc(U)}`), j(`${API}/users/${enc(U)}/repos?per_page=100&sort=updated`)]);
      const [graph, events] = await Promise.all([
        j(`https://github-contributions-api.jogruber.de/v1/${enc(U)}?y=last`).then(d => d.contributions).catch(() => null),
        j(`${API}/users/${enc(U)}/events/public?per_page=8`).catch(() => null)]);
      gh = { u, repos, graph, events }; ghErr = null;
    } catch (e) { if (!gh) ghErr = { NF: "ghNF", RL: "ghRL" }[e.message] || "ghErr"; }
    renderGh();
  }

  /* ---- scroll reveal ---- */
  document.documentElement.classList.add("js");
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rio = "IntersectionObserver" in window && !calm ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }) : null;
  function reveal() {
    document.querySelectorAll(".sec h2,.two p,.student,.card,.stat,.chips li,.qr-box,.gh-top,.sub,.feed li,.graph-wrap,.miles li").forEach(n => {
      if (n.dataset.rv) return; n.dataset.rv = "1";
      const sib = [...n.parentElement.children].indexOf(n); n.style.setProperty("--d", Math.min(sib, 6) * 70 + "ms");
      rio ? rio.observe(n) : n.classList.add("in");
    });
  }
  let raf; new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(reveal); }).observe(document.body, { childList: true, subtree: true });
  renderStatic(); reveal(); loadGh(true); setInterval(() => loadGh(false), 600000);
})();
