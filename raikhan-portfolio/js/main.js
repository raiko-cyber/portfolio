(() => {
  const C = window.CONFIG, D = window.I18N, $ = id => document.getElementById(id);
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  let lang = /^kk/.test(navigator.language) ? "kk" : /^en/.test(navigator.language) ? "en" : "ru";
  try { const sv = localStorage.getItem("lang"); if (sv && Object.prototype.hasOwnProperty.call(D, sv)) lang = sv; } catch {}
  const t = k => D[lang][k], enc = encodeURIComponent;
  const safe = (u, re) => (typeof u === "string" && re.test(u) ? u : "#"), HTTPS = /^https:\/\//, GHURL = /^https:\/\/github\.com\//;
  let tt; const toast = m => { const x = $("toast"); x.textContent = m; x.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => x.classList.remove("show"), 2800); };

  const publicUrl = () => { if (C.siteUrl) return C.siteUrl; const h = location.hostname; return location.protocol.startsWith("http") && h && !["localhost", "127.0.0.1"].includes(h) ? location.href.split("#")[0] : ""; };
  async function copyLink() {
    const u = publicUrl(); if (!u) return toast(t("noUrl"));
    try { await navigator.clipboard.writeText(u); } catch { const a = el("textarea"); a.value = u; document.body.appendChild(a); a.select(); document.execCommand("copy"); a.remove(); }
    toast(t("copied"));
  }

  const tgUser = C.telegram, gh = C.githubUsername;
  const smallContacts = () => [
    [t("phone"), C.phone, C.phone && "tel:" + C.phone.replace(/[^+\d]/g, "")],
    ["Email", C.email, C.email && "mailto:" + C.email],
    ["LinkedIn", C.linkedin && "LinkedIn", C.linkedin && safe(C.linkedin, HTTPS)],
    ["Instagram", C.instagram && "@" + C.instagram, C.instagram && "https://instagram.com/" + enc(C.instagram)],
    ["GitHub", gh && "@" + gh, gh && "https://github.com/" + enc(gh)]].filter(c => c[1]);
  const edu = () => [...C.education, ...C.courses];
  const eduLines = e => [e.campus ? t("edPlace") : e.place, e.group && t("grp") + ": " + e.group, e.faculty && t("fac") + ": " + e.faculty, e.period, e.note].filter(Boolean);
  const studentLine = () => t("a3") + (C.university ? " — " + C.university : "");

  function card(it) {
    const c = el("div", "card"); c.appendChild(el("span", "tag", it[1])); c.appendChild(el("h3", "", it[0])); c.appendChild(el("p", "", it[2])); return c;
  }

  function renderStatic() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(n => n.textContent = t(n.dataset.i18n));
    document.querySelectorAll("#lang button").forEach(b => b.setAttribute("aria-pressed", b.dataset.l === lang));
    const nm = t("name").split(" "), hn = $("heroName"); hn.textContent = nm[0]; hn.appendChild(document.createElement("br")); hn.appendChild(document.createTextNode(nm.slice(1).join(" ")));
    document.title = t("name") + " — Portfolio"; $("fname").textContent = t("name");
    $("student").textContent = studentLine();
    const eg = $("eduGrid"); eg.textContent = ""; edu().forEach(e => { const c = el("div", "card"); c.appendChild(el("h3", "", e.title)); eduLines(e).forEach(l => c.appendChild(el("p", "", l))); eg.appendChild(c); });
    $("eduGrid").previousElementSibling.hidden = !edu().length;
    $("chips").textContent = ""; t("chips").forEach(x => $("chips").appendChild(el("li", "", x)));
    $("projectGrid").textContent = ""; t("projects").forEach((p, i) => { const c = card(p); if (C.projectLinks[i]) { const a = el("a", "", "→"); a.href = safe(C.projectLinks[i], HTTPS); a.target = "_blank"; a.rel = "noopener"; c.appendChild(a); } $("projectGrid").appendChild(c); });
    $("ghLink").href = gh ? "https://github.com/" + enc(gh) : "#"; $("ghLink").hidden = !gh;
    const tg = $("tgBig"); tg.textContent = ""; tg.hidden = !tgUser;
    if (tgUser) { tg.href = "https://t.me/" + enc(tgUser); tg.appendChild(el("small", "", t("tgCta"))); tg.appendChild(el("b", "", "@" + tgUser)); }
    const sl = $("contactSmall"); sl.textContent = ""; smallContacts().forEach(([l, tx, href]) => { const li = el("li"); const a = el("a", "", l === tx ? l : l + ": " + tx); a.href = href; if (href.startsWith("http")) { a.target = "_blank"; a.rel = "noopener"; } li.appendChild(a); sl.appendChild(li); });
    $("btnCv").textContent = t("cv");
    renderQr();
  }

  /* ---- QR on the site ---- */
  function renderQr() {
    const u = publicUrl(), box = $("qrBox"); box.textContent = ""; $("qrDl").hidden = !u;
    if (!u) { $("qrMsg").textContent = t("noUrl"); return; }
    $("qrMsg").textContent = t("qrOk");
    if (typeof QRCode === "undefined") return;
    new QRCode(box, { text: u, width: 220, height: 220, colorDark: "#6F4E37", colorLight: "#E5E4E2", correctLevel: QRCode.CorrectLevel.H });
  }
  $("qrDl").onclick = () => { const cv = $("qrBox").querySelector("canvas"); if (!cv) return; const a = el("a"); a.href = cv.toDataURL("image/png"); a.download = "portfolio-qr.png"; a.click(); };

  /* ---- CV (QR is created offscreen, only for the PDF) ---- */
  function qrDataUrl(u) {
    if (!u || typeof QRCode === "undefined") return null;
    const box = el("div"); new QRCode(box, { text: u, width: 220, height: 220, colorDark: "#6F4E37", colorLight: "#E5E4E2", correctLevel: QRCode.CorrectLevel.H });
    const cv = box.querySelector("canvas"); return cv ? cv.toDataURL("image/png") : null;
  }
  function buildCv() {
    const cv = $("cv"); cv.textContent = "";
    const add = (par, tag, cls, txt) => { const e = el(tag, cls, txt); par.appendChild(e); return e; };
    const head = add(cv, "header", "cv-h"), ht = add(head, "div", "cv-ht"); add(ht, "h1", "", t("name")); if (lang !== "en") add(ht, "p", "cv-lat", C.nameLatin); add(ht, "p", "cv-tag", studentLine());
    const pic = add(head, "img", "cv-photo"); pic.src = "assets/photo.jpg"; pic.alt = ""; pic.addEventListener("error", () => pic.remove());
    const body = add(cv, "div", "cv-b"), side = add(body, "aside"), main = add(body, "section");
    const block = (par, title, items, plain) => { if (!items.length) return; const d = add(par, "div", "cv-s"); add(d, "h2", "", title); const ul = add(d, "ul", plain ? "plain" : ""); items.forEach(i => add(ul, "li", "", i)); };
    const about = add(side, "div", "cv-s"); add(about, "h2", "", t("aboutT")); add(about, "p", "", t("a1")); add(about, "p", "", t("a2"));
    const cl = smallContacts().map(c => c[0] === c[1] ? c[0] : c[0] + ": " + c[1]); if (tgUser) cl.unshift("Telegram: @" + tgUser); block(side, t("cvC"), cl, true);
    const u = publicUrl(), q = qrDataUrl(u);
    if (q) { const d = add(side, "div", "cv-s cv-qr"); add(d, "h2", "", "QR"); const im = add(d, "img"); im.src = q; im.alt = "QR"; add(d, "small", "", u); }
    if (edu().length) { const d = add(main, "div", "cv-s"); add(d, "h2", "", t("cvE")); edu().forEach(e => { const x = add(d, "div", "cv-p"); add(x, "b", "", e.title); eduLines(e).forEach(l => add(x, "p", "", l)); }); }
    const pj = add(main, "div", "cv-s"); add(pj, "h2", "", t("cvP")); t("projects").forEach(p => { const x = add(pj, "div", "cv-p"); add(x, "b", "", p[0]); add(x, "span", "", p[1]); add(x, "p", "", p[2]); });
    const it = add(main, "div", "cv-s"); add(it, "h2", "", t("cvI")); const ch = add(it, "div", "cv-chips"); t("chips").forEach(c => add(ch, "span", "", c));
  }
  $("btnCv").onclick = () => { buildCv(); toast(t("cvHint")); setTimeout(() => window.print(), 700); };
  $("btnCopy").onclick = copyLink;

  /* ---- menu, language, scroll-spy ---- */
  const burger = $("burger"), menu = $("menu");
  burger.onclick = () => { const o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); };
  const links = [...menu.querySelectorAll("a")], secs = links.map(a => document.querySelector(a.getAttribute("href")));
  links.forEach(a => a.onclick = () => { menu.classList.remove("open"); burger.setAttribute("aria-expanded", false); });
  if ("IntersectionObserver" in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach((a, i) => a.classList.toggle("on", secs[i] === e.target)); }), { rootMargin: "-45% 0px -50% 0px" }); secs.forEach(x => x && io.observe(x)); }
  document.querySelectorAll("#lang button").forEach(b => b.onclick = () => { lang = b.dataset.l; try { localStorage.setItem("lang", lang); } catch {} renderStatic(); });
  $("year").textContent = new Date().getFullYear();
  const ph = document.querySelector(".portrait img"); if (ph) { const gone = () => ph.remove(); ph.addEventListener("error", gone); if (ph.complete && !ph.naturalWidth) gone(); }

  /* ---- GitHub: only real repos, only meaningful numbers ---- */
  const API = "https://api.github.com";
  async function j(url) { const r = await fetch(url, { headers: { Accept: "application/vnd.github+json" } }); if (!r.ok) throw new Error(r.status); return r.json(); }
  async function loadGh() {
    if (!gh) return;
    try {
      const hide = new Set([...(C.hideRepos || []), gh].map(x => x.toLowerCase()));
      const repos = (await j(`${API}/users/${enc(gh)}/repos?per_page=100&sort=updated`)).filter(r => !r.fork && !hide.has(r.name.toLowerCase()) && r.size > 0);
      const list = C.pinnedRepos.length ? C.pinnedRepos.map(n => repos.find(r => r.name.toLowerCase() === n.toLowerCase())).filter(Boolean) : repos.sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at)).slice(0, 6);
      const box = $("ghRepos"); box.textContent = "";
      list.forEach(r => { const c = el("a", "card link"); c.href = safe(r.html_url, GHURL); c.target = "_blank"; c.rel = "noopener"; c.appendChild(el("span", "tag", r.language || "GitHub")); c.appendChild(el("h3", "", r.name)); if (r.description) c.appendChild(el("p", "", r.description)); if (r.stargazers_count >= 5) c.appendChild(el("p", "", "★ " + r.stargazers_count)); box.appendChild(c); });
      $("ghBox").hidden = !list.length; $("ghRepos").parentElement.querySelector(".sub").hidden = !list.length;
      const g = await j(`https://github-contributions-api.jogruber.de/v1/${enc(gh)}?y=last`).then(d => d.contributions).catch(() => null);
      const total = g ? g.reduce((s, x) => s + x.count, 0) : 0;
      if (g && total >= (C.minGraphTotal || 30)) {
        const gr = $("ghGraph"); gr.textContent = ""; const pad = new Date(g[0].date).getUTCDay(); for (let i = 0; i < pad; i++) gr.appendChild(el("i")).style.visibility = "hidden";
        g.forEach(x => { const i = el("i"); i.dataset.l = String(x.level | 0).slice(0, 1); i.title = x.date + ": " + x.count; gr.appendChild(i); });
        $("ghGraphMsg").textContent = total + " " + t("graphTotal"); $("graphBox").hidden = false; $("ghBox").hidden = false;
      }
    } catch { /* GitHub недоступен — блок просто не показываем, остальной сайт работает */ }
  }

  /* ---- scroll reveal ---- */
  document.documentElement.classList.add("js");
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rio = "IntersectionObserver" in window && !calm ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }) : null;
  function reveal() { document.querySelectorAll(".sec h2,.two p,.student,.card,.qr-card,.chips li,.tg,.small-links li,.note,.graph-wrap").forEach(n => { if (n.dataset.rv) return; n.dataset.rv = "1"; n.style.setProperty("--d", Math.min([...n.parentElement.children].indexOf(n), 6) * 70 + "ms"); rio ? rio.observe(n) : n.classList.add("in"); }); }
  let raf; new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(reveal); }).observe(document.body, { childList: true, subtree: true });

  renderStatic(); reveal(); loadGh();
})();
