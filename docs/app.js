"use strict";
const esc = s => LocalChat.escapeHtml(s == null ? "" : s);
const TAMIL = /[஀-௿]/;
const PAGE = 20;
let DB = null, current = [], shown = 0;

/* Rough sound-alike key so "seya", "ceya" and "cheya" all match the ISO transliteration. */
function phonetic(text) {
  return LocalChat.normalise(text)
    .replace(/zh/g, "l").replace(/(sh|ch|s|j)/g, "c").replace(/th|dh|d/g, "t").replace(/b/g, "p").replace(/g/g, "k")
    .replace(/w/g, "v").replace(/aa/g, "a").replace(/ee|ii/g, "i").replace(/oo|uu/g, "u").replace(/([a-z])\1+/g, "$1");
}

function workOf(item) { return DB.works[item.work]; }
function authorOf(item) { return DB.authors[workOf(item).author]; }
function chapterOf(item) {
  if (item.work !== "kural") return null;
  for (const p of DB.kural_structure) for (const s of p.sections) for (const c of s.chapters) if (c.number === item.chapter) return { p, s, c };
  return null;
}

function prepare() {
  const chapters = new Map();
  for (const p of DB.kural_structure) for (const s of p.sections) for (const c of s.chapters) chapters.set(c.number, { p, s, c });
  for (const item of DB.items) {
    const ch = chapters.get(item.chapter);
    item._ta = [...item.lines, item.meaning_ta || "", ch ? ch.c.ta + " " + ch.s.ta + " " + ch.p.ta : ""].join(" ");
    item._en = LocalChat.normalise([item.en, item.en_prose].join(" "));
    item._meta = LocalChat.normalise([ch ? ch.c.en + " " + ch.s.en + " " + ch.p.en : "", item.themes.map(t => DB.themes[t][1] + " " + t).join(" ")].join(" "));
    item._ph = phonetic(item.translit + " " + (ch ? ch.c.translit : ""));
    item._ch = ch;
  }
}

function score(item, terms) {
  let total = 0;
  for (const term of terms) {
    let s = 0;
    if (TAMIL.test(term)) {
      let from = 0, idx;
      while ((idx = item._ta.indexOf(term, from)) !== -1) { s += 3; from = idx + term.length; }
    } else {
      const t = LocalChat.normalise(term);
      const re = new RegExp("\\b" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      if (re.test(item._en)) s += 2;
      if (re.test(item._meta)) s += 3;
      const p = phonetic(term);
      if (p.length >= 3 && item._ph.includes(p)) s += 2;
      if (/^\d+$/.test(term) && item.num === +term) s += 10;
    }
    if (!s) return 0;  // every term must match somewhere
    total += s;
  }
  return total;
}

function filters() {
  return {
    work: document.getElementById("f-work").value, author: document.getElementById("f-author").value,
    category: document.getElementById("f-category").value, theme: document.getElementById("f-theme").value,
  };
}

function search(query, f = filters()) {
  const terms = String(query || "").trim().split(/\s+/).filter(Boolean);
  let items = DB.items.filter(i => (!f.work || i.work === f.work) && (!f.author || workOf(i).author === f.author)
    && (!f.category || (i.work === "kural" && String(i.category) === f.category)) && (!f.theme || i.themes.includes(f.theme)));
  if (!terms.length) return items;
  return items.map(i => [i, score(i, terms)]).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).map(([i]) => i);
}

function highlight(text, terms) {
  let html = esc(text);
  for (const t of terms) {
    if (t.length < 2) continue;
    const re = new RegExp("(" + esc(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", TAMIL.test(t) ? "g" : "gi");
    html = html.replace(re, "<mark>$1</mark>");
  }
  return html;
}

function verseCard(item, terms = []) {
  const w = workOf(item), a = authorOf(item), ch = item._ch;
  const where = ch ? `${esc(ch.p.ta)} · ${esc(ch.c.ta)} (${esc(ch.c.en)})` : esc(item.group || w.category_en);
  return `<article class="verse" id="${item.id}">
    <div class="verse-head"><span><strong>${esc(w.ta)} ${item.num}</strong> · ${esc(a.ta)} (${esc(a.en)})</span><span>${where}</span></div>
    <div class="verse-lines">${item.lines.map(l => highlight(l, terms)).join("<br>")}</div>
    <div class="verse-translit">${highlight(item.translit, terms)}</div>
    ${item.en ? `<p class="verse-en">${highlight(item.en, terms)}</p><p class="verse-en-prose">${highlight(item.en_prose, terms)} <small>(G. U. Pope, 1886)</small></p>` : ""}
    ${item.meaning_ta ? `<p class="verse-en-prose">பொருள்: ${highlight(item.meaning_ta, terms)} <small>(விக்கிமூலம்)</small></p>` : ""}
    <div class="tags">${item.themes.map(t => `<button type="button" class="tag" data-theme="${t}">${esc(DB.themes[t][0])} · ${esc(DB.themes[t][1])}</button>`).join("")}</div>
  </article>`;
}

function render(list, terms) {
  current = list; shown = 0;
  document.getElementById("results").innerHTML = "";
  document.getElementById("result-count").textContent = list.length ? `${list.length} verse${list.length === 1 ? "" : "s"} found` : "No verses found. Try a shorter word, a Tamil word, or remove a filter.";
  showMore(terms);
}

function showMore(terms) {
  const next = current.slice(shown, shown + PAGE);
  document.getElementById("results").insertAdjacentHTML("beforeend", next.map(i => verseCard(i, terms)).join(""));
  shown += next.length;
  document.getElementById("more").hidden = shown >= current.length;
}

function runSearch(push = true) {
  const q = document.getElementById("q").value;
  const f = filters();
  render(search(q, f), q.trim().split(/\s+/).filter(Boolean));
  document.querySelectorAll("#theme-chips button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.theme === f.theme)));
  if (push) {
    const params = new URLSearchParams(Object.entries({ q, ...f }).filter(([, v]) => v));
    history.replaceState(null, "", "#search" + (params.toString() ? "?" + params : ""));
  }
}

function setupSearch() {
  const work = document.getElementById("f-work"), author = document.getElementById("f-author");
  const category = document.getElementById("f-category"), theme = document.getElementById("f-theme");
  for (const [k, w] of Object.entries(DB.works)) work.add(new Option(`${w.ta} (${w.en})`, k));
  for (const [k, a] of Object.entries(DB.authors)) author.add(new Option(`${a.ta} (${a.en})`, k));
  for (const p of DB.kural_structure) category.add(new Option(`${p.ta} (${p.en})`, p.number));
  for (const [k, [ta, en]] of Object.entries(DB.themes)) theme.add(new Option(`${ta} · ${en}`, k));
  document.getElementById("theme-chips").innerHTML = Object.entries(DB.themes).map(([k, [ta, en]]) => `<button type="button" data-theme="${k}" aria-pressed="false">${esc(ta)} · ${esc(en)}</button>`).join("");
  document.getElementById("search-form").addEventListener("submit", e => { e.preventDefault(); runSearch(); });
  [work, author, category, theme].forEach(s => s.addEventListener("change", () => runSearch()));
  document.getElementById("more").addEventListener("click", () => showMore(document.getElementById("q").value.trim().split(/\s+/)));
  document.getElementById("random").addEventListener("click", () => {
    const list = search("", filters());
    render([list[Math.floor(Math.random() * list.length)]], []);
  });
  document.addEventListener("click", e => {
    const b = e.target.closest("button[data-theme]");
    if (!b) return;
    theme.value = theme.value === b.dataset.theme && b.closest("#theme-chips") ? "" : b.dataset.theme;
    location.hash = "#search";
    runSearch();
  });
  const params = new URLSearchParams((location.hash.split("?")[1]) || "");
  document.getElementById("q").value = params.get("q") || "";
  work.value = params.get("work") || ""; author.value = params.get("author") || "";
  category.value = params.get("category") || ""; theme.value = params.get("theme") || "";
  runSearch(false);
}

function setupKural() {
  const paal = document.getElementById("k-paal"), iyal = document.getElementById("k-iyal"), chap = document.getElementById("k-chapter");
  const fill = (sel, items, label) => { sel.innerHTML = ""; items.forEach(x => sel.add(new Option(label(x), x.number))); };
  const showChapter = () => {
    const n = +chap.value;
    const items = DB.items.filter(i => i.work === "kural" && i.chapter === n);
    document.getElementById("kural-list").innerHTML = items.map(i => verseCard(i)).join("");
  };
  const onIyal = () => { const s = currentSection(); fill(chap, s.chapters, c => `${c.number}. ${c.ta} (${c.en})`); showChapter(); };
  const currentPaal = () => DB.kural_structure.find(p => p.number === +paal.value);
  const currentSection = () => currentPaal().sections.find(s => s.number === +iyal.value);
  const onPaal = () => { fill(iyal, currentPaal().sections, s => `${s.ta} (${s.en})`); onIyal(); };
  fill(paal, DB.kural_structure, p => `${p.ta} (${p.en})`);
  paal.addEventListener("change", onPaal); iyal.addEventListener("change", onIyal); chap.addEventListener("change", showChapter);
  onPaal();
  return n => {  // jump to a chapter
    for (const p of DB.kural_structure) for (const s of p.sections) if (s.chapters.some(c => c.number === n)) {
      paal.value = p.number; onPaal(); iyal.value = s.number; onIyal(); chap.value = n; showChapter();
    }
  };
}

function setupLearning() {
  document.getElementById("lessons").innerHTML = LESSONS.map(l => `<article class="card" id="lesson-${l.id}"><h2>${esc(l.ta)}<small>${esc(l.en)}</small></h2>${l.body}</article>`).join("");
  document.getElementById("timeline").innerHTML = HISTORY.map(h => `<li id="history-${h.id}"><span class="when">${esc(h.when)}</span><h2>${esc(h.title)}</h2><p>${esc(h.body)}</p></li>`).join("");
}

function showTab() {
  const name = (location.hash.slice(1).split("?")[0]) || "search";
  const tab = document.getElementById("tab-" + name) ? name : "search";
  document.querySelectorAll(".tab").forEach(s => { s.hidden = s.id !== "tab-" + tab; });
  document.querySelectorAll(".tabs a").forEach(a => { if (a.dataset.tab !== tab) a.removeAttribute("aria-current"); else a.setAttribute("aria-current", "page"); });
  if (tab === "inscription" && window.Inscription) window.Inscription.init();
}

/* ---- Chat helper ---- */
function setupChat(gotoChapter) {
  const docs = [
    ...LESSONS.map(l => ({ id: "lesson-" + l.id, kind: "lesson", text: `${l.ta} ${l.en} ${l.keys} ${l.keys} ${l.body.replace(/<[^>]+>/g, " ")}`, item: l })),
    ...HISTORY.map(h => ({ id: "history-" + h.id, kind: "history", text: `${h.title} ${h.keys} ${h.keys} ${h.when} ${h.body}`, item: h })),
    { id: "insc", kind: "help", text: "inscription kalvettu கல்வெட்டு stone photo upload age date era script brahmi grantha read ocr opencv", html: `<p>Open the <a href="#inscription">கல்வெட்டு (Inscriptions)</a> tab and choose a photo. OpenCV finds letter-like shapes and compares them with Tamil-Brahmi, Grantha and modern Tamil letters to suggest a script and a rough era. It runs in your browser and can't date a stone exactly.</p>` },
    { id: "site", kind: "help", text: "what can you do help how use this site search filter theme author category", html: `<p>I can find verses by theme ("kural about friendship"), by number ("kural 391", "aathichudi 5"), explain grammar ("what is vallinam?") or history ("who were the Cholas?"). The search box above also filters by work, author, category and theme.</p>` },
  ];
  const index = new LocalChat.Index(docs);
  const themeWords = Object.entries(DB.themes).map(([k, [ta, en]]) => [k, [ta, ...LocalChat.tokens(en), k]]);
  const brief = i => `<p><strong>${esc(workOf(i).ta)} ${i.num}</strong>: ${i.lines.map(esc).join(" / ")}${i.en ? `<br><em>${esc(i.en)}</em>` : ""}${i.meaning_ta ? `<br>${esc(i.meaning_ta)}` : ""}</p>`;
  const avatar = `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#9b3d12"/><rect x="9" y="13" width="22" height="14" rx="3" fill="#f6d9a8"/><path d="M12 17h16M12 20h12M12 23h14" stroke="#7a3a12" stroke-width="1.4" stroke-linecap="round"/><circle cx="9" cy="20" r="3" fill="#e9b872"/><circle cx="31" cy="20" r="3" fill="#e9b872"/></svg>`;
  LocalChat.createChat({
    title: "தோழன் · Thozhan", subtitle: "Your Tamil study friend · runs in your browser", launcherLabel: "Ask Thozhan", avatar,
    placeholder: "Ask in English or தமிழ்…",
    greeting: `<p>வணக்கம்! I'm Thozhan. Ask me for a kural on any theme, a verse by number, a grammar term or a piece of Tamil history.</p>`,
    suggestions: ["Kural about friendship", "Kural 391", "What is vallinam?", "Who were the Cholas?", "How do I date an inscription?"],
    answer: async text => {
      const t = LocalChat.normalise(text);
      const num = t.match(/(kural|குறள்|aathichudi|athichudi|ஆத்திசூடி|puthiya|bharathi|பாரதி)\D*(\d{1,4})/);
      if (num) {
        const work = /aathi|athi|ஆத்தி/.test(num[1]) && !/puthiya/.test(t) ? "aathichudi" : /puthiya|bharathi|பாரதி/.test(num[1]) ? "puthiya" : "kural";
        const item = DB.items.find(i => i.work === work && i.num === +num[2]);
        return { html: item ? brief(item) + `<p><a href="#search?q=${item.num}&work=${work}">Open it in search</a></p>` : `<p>I couldn't find that number.</p>` };
      }
      const qTokens = new Set(LocalChat.tokens(text).filter(w => w.length > 3));
      let chapterHit = null, bestOverlap = 0;
      for (const c of DB.kural_structure.flatMap(p => p.sections.flatMap(s => s.chapters))) {
        const overlap = text.includes(c.ta) ? 99 : LocalChat.tokens(c.en).filter(w => w.length > 3 && qTokens.has(w)).length;
        if (overlap > bestOverlap) { bestOverlap = overlap; chapterHit = c; }
      }
      const theme = themeWords.find(([, words]) => words.some(w => w.length > 2 && (t.includes(LocalChat.normalise(w)) || text.includes(w))));
      if ((/(kural|குறள்|verse|poem|quote|line|பாடல்|about|on)\b/.test(t) || TAMIL.test(text)) && (chapterHit || theme)) {
        if (chapterHit) {
          const items = DB.items.filter(i => i.work === "kural" && i.chapter === chapterHit.number).slice(0, 2);
          return { html: `<p>From chapter ${chapterHit.number}, ${esc(chapterHit.ta)} (${esc(chapterHit.en)}):</p>` + items.map(brief).join("") + `<p><a href="#kural" data-chapter="${chapterHit.number}">Read all 10 kurals</a></p>` };
        }
        const pool = DB.items.filter(i => i.themes.includes(theme[0]));
        const pick = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
        return { html: `<p>${pool.length} verses are tagged ${esc(DB.themes[theme[0]][0])} (${esc(DB.themes[theme[0]][1])}). Here are three:</p>` + pick.map(brief).join("") + `<p><a href="#search?theme=${theme[0]}">See them all</a></p>`, suggestions: ["Another one", "Kural about education", "What is a kural venba?"] };
      }
      if (/another|one more|innoru|இன்னொரு/.test(t)) {
        const i = DB.items[Math.floor(Math.random() * DB.items.length)];
        return { html: brief(i) };
      }
      const hits = index.search(text, 1);
      if (hits.length && hits[0].score > 0.05) {
        const d = hits[0].doc;
        if (d.kind === "lesson") return { html: `<p><strong>${esc(d.item.ta)}</strong> (${esc(d.item.en)})</p>${d.item.body}<p><a href="#grammar">More grammar</a></p>` };
        if (d.kind === "history") return { html: `<p><strong>${esc(d.item.title)}</strong> · ${esc(d.item.when)}</p><p>${esc(d.item.body)}</p><p><a href="#history">See the timeline</a></p>` };
        return { html: d.html };
      }
      const found = search(text).slice(0, 2);
      if (found.length) return { html: `<p>These verses match your words:</p>` + found.map(brief).join("") };
      return { html: `<p>I couldn't find that. Try a theme (friendship, rain, learning), a number ("kural 100"), or a grammar word (வேற்றுமை, sandhi).</p>` };
    },
  });
  document.addEventListener("click", e => {
    const a = e.target.closest("a[data-chapter]");
    if (a) { e.preventDefault(); location.hash = "#kural"; gotoChapter(+a.dataset.chapter); }
  });
}

async function main() {
  DB = await (await fetch("data/texts.json")).json();
  prepare();
  setupSearch();
  const gotoChapter = setupKural();
  setupLearning();
  setupChat(gotoChapter);
  window.addEventListener("hashchange", () => { showTab(); if (location.hash.startsWith("#search?")) setupSearchFromHash(); });
  showTab();
}
function setupSearchFromHash() {
  const params = new URLSearchParams(location.hash.split("?")[1] || "");
  document.getElementById("q").value = params.get("q") || "";
  ["work", "author", "category", "theme"].forEach(k => { document.getElementById("f-" + k).value = params.get(k) || ""; });
  runSearch(false);
}
main().catch(err => { document.querySelector("main").insertAdjacentHTML("afterbegin", `<p class="note">Could not load the verses: ${esc(err.message)}</p>`); });
