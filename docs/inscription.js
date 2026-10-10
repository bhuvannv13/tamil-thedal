/* Inscription helper: OpenCV.js image clean-up, letter-shape extraction and script comparison.
   Everything runs locally in the browser. */
(function () {
  "use strict";
  const OPENCV_URL = "https://docs.opencv.org/4.10.0/opencv.js";
  const TESSERACT_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
  const cp = n => String.fromCodePoint(n);
  const SCRIPTS = [
    { key: "brahmi", name: "Tamil-Brahmi", font: "Noto Sans Brahmi", css: "ref-brahmi",
      era: "roughly the 3rd century BCE to the 4th century CE",
      glyphs: [0x11005, 0x11006, 0x11007, 0x11009, 0x1100F, 0x11011, 0x11013, 0x11017, 0x11018, 0x1101A, 0x1101B, 0x1101D, 0x11022, 0x11026, 0x11027, 0x1102B, 0x1102C, 0x1102D, 0x1102E, 0x1102F, 0x11035, 0x11036, 0x11037].map(cp) },
    { key: "grantha", name: "Grantha", font: "Noto Sans Grantha", css: "ref-grantha",
      era: "roughly the 6th to 13th century CE (Pallava and Chola periods)",
      glyphs: [0x11305, 0x11306, 0x11307, 0x11309, 0x1130F, 0x11313, 0x11315, 0x11319, 0x1131A, 0x1131E, 0x1131F, 0x11323, 0x11324, 0x11328, 0x1132A, 0x1132E, 0x1132F, 0x11330, 0x11332, 0x11333, 0x11335].map(cp) },
    { key: "tamil", name: "Modern Tamil", font: "Noto Sans Tamil", css: "",
      era: "after about the 16th century, when letters approach today's shapes",
      glyphs: "அ ஆ இ உ எ ஒ க ங ச ஞ ட ண த ந ப ம ய ர ல வ ழ ள ற ன".split(" ") },
  ];
  const SIZE = 64;
  let cvReady = null, started = false, refs = null, lastCanvas = null;
  const $ = id => document.getElementById(id);
  const status = text => { $("insc-status").textContent = text; };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src; s.async = true; s.onload = resolve; s.onerror = () => reject(new Error("Could not load " + src));
      document.head.appendChild(s);
    });
  }

  function loadOpenCV() {
    if (!cvReady) cvReady = loadScript(OPENCV_URL).then(() => new Promise(resolve => {
      const done = () => resolve(window.cv);
      if (window.cv instanceof Promise) window.cv.then(m => { window.cv = m; resolve(m); });
      else if (window.cv && window.cv.Mat) done();
      else window.cv.onRuntimeInitialized = done;
    }));
    return cvReady;
  }

  /* Shape signature: log-scaled Hu moments of a binary glyph image (white letter on black). */
  function signature(cv, mask) {
    const m = cv.moments(mask, true);
    const hu = new cv.Mat();
    cv.HuMoments(m, hu);
    const out = [];
    for (let i = 0; i < 7; i++) {
      const h = hu.data64F[i];
      out.push(h === 0 ? 0 : -Math.sign(h) * Math.log10(Math.abs(h)));
    }
    hu.delete();
    return out;
  }

  function distance(a, b) {  // like OpenCV's CONTOURS_MATCH_I3 on log-scaled moments
    let d = 0;
    for (let i = 0; i < 7; i++) if (a[i] && b[i]) d = Math.max(d, Math.abs(a[i] - b[i]) / Math.abs(a[i]));
    return d;
  }

  /* Draw a glyph into a SIZE x SIZE canvas and return a binary mask. */
  function glyphMask(cv, ch, font) {
    const c = document.createElement("canvas");
    c.width = c.height = SIZE;
    const g = c.getContext("2d");
    g.fillStyle = "#000"; g.fillRect(0, 0, SIZE, SIZE);
    g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `48px "${font}"`;
    g.fillText(ch, SIZE / 2, SIZE / 2 + 2);
    const src = cv.imread(c), gray = new cv.Mat(), bin = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.threshold(gray, bin, 100, 255, cv.THRESH_BINARY);
    src.delete(); gray.delete();
    return bin;
  }

  async function buildReferences(cv) {
    await Promise.all(SCRIPTS.map(s => document.fonts.load(`48px "${s.font}"`, s.glyphs.join(""))));
    return SCRIPTS.map(s => ({ ...s, sigs: s.glyphs.map(ch => { const m = glyphMask(cv, ch, s.font); const sig = signature(cv, m); m.delete(); return sig; }) }));
  }

  /* Normalise a crop to SIZE x SIZE keeping its aspect ratio. */
  function normalise(cv, crop) {
    const scale = (SIZE - 8) / Math.max(crop.cols, crop.rows);
    const w = Math.max(1, Math.round(crop.cols * scale)), h = Math.max(1, Math.round(crop.rows * scale));
    const resized = new cv.Mat();
    cv.resize(crop, resized, new cv.Size(w, h), 0, 0, cv.INTER_AREA);
    const out = cv.Mat.zeros(SIZE, SIZE, cv.CV_8UC1);
    resized.copyTo(out.roi(new cv.Rect(Math.floor((SIZE - w) / 2), Math.floor((SIZE - h) / 2), w, h)));
    resized.delete();
    return out;
  }

  async function analyse(canvas) {
    lastCanvas = canvas;
    const cv = await loadOpenCV();
    if (!refs) refs = await buildReferences(cv);
    const clip = +$("insc-clahe").value, minArea = +$("insc-minarea").value, invert = $("insc-invert").checked;
    const src = cv.imread(canvas), gray = new cv.Mat(), eq = new cv.Mat(), blur = new cv.Mat(), bin = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    const clahe = new cv.CLAHE(clip, new cv.Size(8, 8));
    clahe.apply(gray, eq);
    cv.GaussianBlur(eq, blur, new cv.Size(5, 5), 0);
    const block = Math.max(15, (Math.round(Math.min(canvas.width, canvas.height) / 20) | 1));
    cv.adaptiveThreshold(blur, bin, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, invert ? cv.THRESH_BINARY : cv.THRESH_BINARY_INV, block, 8);
    const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(3, 3));
    cv.morphologyEx(bin, bin, cv.MORPH_OPEN, kernel);
    cv.morphologyEx(bin, bin, cv.MORPH_CLOSE, kernel);

    const labels = new cv.Mat(), stats = new cv.Mat(), centroids = new cv.Mat();
    const n = cv.connectedComponentsWithStats(bin, labels, stats, centroids, 8, cv.CV_32S);
    const maxArea = canvas.width * canvas.height * 0.05;
    let boxes = [];
    for (let i = 1; i < n; i++) {
      const x = stats.intAt(i, 0), y = stats.intAt(i, 1), w = stats.intAt(i, 2), h = stats.intAt(i, 3), area = stats.intAt(i, 4);
      const aspect = w / h;
      if (area >= minArea && area <= maxArea && aspect > 0.2 && aspect < 5 && w > 6 && h > 6) boxes.push({ x, y, w, h, area });
    }
    boxes = boxes.sort((a, b) => b.area - a.area).slice(0, 80);

    const totals = refs.map(() => 0);
    for (const b of boxes) {
      const crop = bin.roi(new cv.Rect(b.x, b.y, b.w, b.h));
      const norm = normalise(cv, crop);
      const sig = signature(cv, norm);
      refs.forEach((r, k) => { totals[k] += Math.min(...r.sigs.map(s => distance(sig, s))); });
      crop.delete(); norm.delete();
    }

    const out = new cv.Mat();
    cv.cvtColor(bin, out, cv.COLOR_GRAY2RGBA);
    for (const b of boxes) cv.rectangle(out, new cv.Point(b.x, b.y), new cv.Point(b.x + b.w, b.y + b.h), new cv.Scalar(229, 138, 90, 255), 2);
    const outCanvas = $("insc-out");
    cv.imshow(outCanvas, out);
    [src, gray, eq, blur, bin, kernel, labels, stats, centroids, out].forEach(m => m.delete());
    clahe.delete();
    report(boxes.length, totals);
  }

  function report(count, totals) {
    const box = $("insc-result");
    box.hidden = false;
    if (count < 5) {
      box.innerHTML = `<h2>Not enough letter shapes found</h2><p>Only ${count} letter-like shapes were found. Try a closer, evenly lit photo, raise the contrast, lower the letter size filter, or tick "letters are lighter than the stone".</p>`;
      status("Done.");
      return;
    }
    const avg = totals.map(t => t / count);
    const sims = avg.map(d => Math.exp(-d * 3));
    const sum = sims.reduce((a, b) => a + b, 0);
    const shares = sims.map(s => s / sum);
    const order = shares.map((s, i) => i).sort((a, b) => shares[b] - shares[a]);
    const best = refs[order[0]], margin = shares[order[0]] - shares[order[1]];
    const confidence = margin > 0.15 ? "a clear lean" : margin > 0.06 ? "a weak lean" : "no clear preference";
    box.innerHTML = `<h2>Closest script: ${best.name}</h2>
      <p>${count} letter-like shapes were compared with ${refs.reduce((a, r) => a + r.glyphs.length, 0)} reference letters. The shapes show <strong>${confidence}</strong> towards ${best.name}, which was in use ${best.era}.</p>
      <div class="scores">${order.map(i => `<div class="score-row"><span>${refs[i].name}</span><span class="score-bar"><span style="width:${(shares[i] * 100).toFixed(0)}%"></span></span><span>${(shares[i] * 100).toFixed(0)}%</span></div>`).join("")}</div>
      <p class="muted">This compares overall letter outlines (Hu moments), so worn stone, shadows and decorative carving all affect it. Vatteluttu and transitional Tamil scripts have no standard digital font and are not included. Treat this as a starting point and compare by eye with the reference letters below.</p>`;
    status("Done.");
  }

  function drawToCanvas(img) {
    const canvas = $("insc-in");
    const scale = Math.min(1, 900 / Math.max(img.width, img.height));
    canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    $("insc-ocr").disabled = false;
    return canvas;
  }

  async function sample() {
    await document.fonts.load('40px "Noto Sans Brahmi"', cp(0x11013));
    const c = document.createElement("canvas");
    c.width = 760; c.height = 300;
    const g = c.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 760, 300);
    grad.addColorStop(0, "#8d8478"); grad.addColorStop(1, "#6f665b");
    g.fillStyle = grad; g.fillRect(0, 0, 760, 300);
    for (let i = 0; i < 9000; i++) { const v = 80 + Math.random() * 90; g.fillStyle = `rgba(${v},${v - 6},${v - 14},.35)`; g.fillRect(Math.random() * 760, Math.random() * 300, 2, 2); }
    g.fillStyle = "#2c2620"; g.font = '58px "Noto Sans Brahmi"'; g.textBaseline = "middle";
    const brahmi = SCRIPTS[0].glyphs;
    for (let row = 0; row < 3; row++) {
      let text = "";
      for (let k = 0; k < 11; k++) text += brahmi[(row * 7 + k * 3) % brahmi.length];
      g.fillText(text, 30, 60 + row * 90);
    }
    const img = new Image();
    img.onload = () => { drawToCanvas(img); status("Analysing a generated sample written in Tamil-Brahmi letters…"); analyse($("insc-in")).catch(fail); };
    img.src = c.toDataURL();
  }

  function fail(err) { console.error(err); status("Something went wrong: " + err.message); }

  async function ocr() {
    if (!lastCanvas) return;
    status("Loading the Tamil OCR model (about 2 MB, first time only)…");
    if (!window.Tesseract) await loadScript(TESSERACT_URL);
    const result = await window.Tesseract.recognize(lastCanvas, "tam");
    const text = (result.data.text || "").trim();
    const box = $("insc-result");
    box.hidden = false;
    box.insertAdjacentHTML("beforeend", `<h2>Text read by OCR (modern Tamil only)</h2><p>${text ? LocalChat.escapeHtml(text).replace(/\n/g, "<br>") : "No modern Tamil text was recognised."}</p><p class="muted">Tesseract OCR is trained on printed modern Tamil. It will not read Tamil-Brahmi, Vatteluttu or Grantha.</p>`);
    status("Done.");
  }

  function renderReference() {
    $("insc-reference").innerHTML = SCRIPTS.map(s => `<div class="ref-row"><div><strong>${s.name}</strong><br><small class="muted">${s.era}</small></div><div class="ref-glyphs ${s.css}" lang="ta">${s.glyphs.join(" ")}</div></div>`).join("");
  }

  function init() {
    if (started) return;
    started = true;
    renderReference();
    loadOpenCV().then(() => status("Ready. Choose a photo of an inscription, or try the sample.")).catch(fail);
    $("insc-file").addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;
      const img = new Image();
      img.onload = () => { drawToCanvas(img); status("Analysing…"); analyse($("insc-in")).catch(fail); URL.revokeObjectURL(img.src); };
      img.src = URL.createObjectURL(file);
    });
    $("insc-sample").addEventListener("click", () => sample().catch(fail));
    ["insc-clahe", "insc-minarea", "insc-invert"].forEach(id => $(id).addEventListener("change", () => { if (lastCanvas) analyse(lastCanvas).catch(fail); }));
    $("insc-ocr").addEventListener("click", () => ocr().catch(fail));
  }

  window.Inscription = { init };
})();
