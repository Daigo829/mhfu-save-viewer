(function () {
  "use strict";

  // ============================================================
  // MHFU Save Viewer — READ ONLY. Never writes or downloads.
  // ============================================================

  const EXPECT = 438528;   // decrypted MHP2G save size
  const PAIR   = 0xB4;     // a record's smallest% slot = largest% slot + 0xB4
  const CACHE  = 0x67408;  // guild-card display cache, per base species, 8 bytes:
                           //   [u16 tag=0x001D][u16 hunted][u16 max*10 cm][u16 min*10 cm]

  // Complete record map, guild-card order. Per monster:
  //   mini/king = crown thresholds (%). Small crown if smallest% <= mini; king crown if largest% >= king.
  //   recs = [formName, largestOffset, legalMin%, legalMax%]. smallest% offset = largestOffset + 0xB4.
  // Base species first, then subspecies by offset (= internal-ID order).
  const MONS = [
    { n: "Giadrome", card: 0, base: 738.4, mini: 90, king: 123, recs: [["Giadrome", 0x417A, 88, 135]] },
    { n: "Velocidrome", card: 1, base: 738.4, mini: 90, king: 123, recs: [["Velocidrome", 0x4116, 88, 130]] },
    { n: "Gendrome", card: 2, base: 732.1, mini: 90, king: 123, recs: [["Gendrome", 0x4118, 89, 131]] },
    { n: "Iodrome", card: 3, base: 774.6, mini: 90, king: 136, recs: [["Iodrome", 0x411E, 89, 145]] },
    { n: "Yian Kut-Ku", card: 4, base: 919.8, mini: 90, king: 122, recs: [["Yian Kut-Ku", 0x40EC, 50, 131], ["Blue Yian Kut-Ku", 0x412C, 87, 131]] },
    { n: "Yian Garuga", card: 5, base: 1031.7, mini: 91, king: 121, recs: [["Yian Garuga", 0x4130, 86, 130], ["Yian Garuga (One-Eyed)", 0x417C, 87, 130]] },
    { n: "Gypceros", card: 6, base: 1013.7, mini: 93, king: 125, recs: [["Gypceros", 0x4108, 88, 135], ["Purple Gypceros", 0x412E, 89, 135]] },
    { n: "Hypnocatrice", card: 7, base: 834.9, mini: 91, king: 121, recs: [["Hypnocatrice", 0x4184, 88, 141]] },
    { n: "Rathian", card: 8, base: 1645.6, mini: 93, king: 129, recs: [["Rathian", 0x40E2, 88, 140], ["Pink Rathian", 0x412A, 89, 140], ["Gold Rathian", 0x4134, 92, 140]] },
    { n: "Rathalos", card: 9, base: 1629.4, mini: 90, king: 127, recs: [["Rathalos", 0x40F6, 88, 140], ["Azure Rathalos", 0x4132, 88, 140], ["Silver Rathalos", 0x4142, 92, 140]] },
    { n: "Khezu", card: 10, base: 873.2, mini: 93, king: 135, recs: [["Khezu", 0x40FE, 50, 138], ["Red Khezu", 0x413A, 92, 139]] },
    { n: "Basarios", card: 11, base: 1297.6, mini: 93, king: 129, recs: [["Basarios", 0x410C, 89, 133]] },
    { n: "Gravios", card: 12, base: 2099.9, mini: 97, king: 135, recs: [["Gravios", 0x4102, 93, 143], ["Black Gravios", 0x413E, 94, 144]] },
    { n: "Monoblos", card: 13, base: 2004.2, mini: 94, king: 127, recs: [["Monoblos", 0x4114, 93, 140], ["White Monoblos", 0x4138, 94, 140]] },
    { n: "Diablos", card: 14, base: 1993.4, mini: 97, king: 139, recs: [["Diablos", 0x40FC, 95, 154], ["Black Diablos", 0x4136, 95, 150]] },
    { n: "Tigrex", card: 15, base: 1735.3, mini: 90, king: 123, recs: [["Tigrex", 0x4176, 88, 138]] },
    { n: "Nargacuga", card: 16, base: 1602.2, mini: 90, king: 123, recs: [["Nargacuga", 0x4182, 86, 131]] },
    { n: "Cephadrome", card: 17, base: 1538.3, mini: 93, king: 122, recs: [["Cephadrome", 0x40F0, 89, 131]] },
    { n: "Plesioth", card: 18, base: 2315.2, mini: 97, king: 134, recs: [["Plesioth", 0x410A, 93, 140], ["Green Plesioth", 0x413C, 94, 140]] },
    { n: "Lavasioth", card: 19, base: 2223.2, mini: 85, king: 116, recs: [["Lavasioth", 0x4186, 81, 128]] },
    { n: "Daimyo Hermitaur", card: 20, base: 1044.0, mini: 88, king: 123, recs: [["Daimyo Hermitaur", 0x4140, 85, 127], ["Plum Daimyo Hermitaur", 0x418C, 86, 128]] },
    { n: "Shogun Ceanataur", card: 21, base: 863.0, mini: 94, king: 120, recs: [["Shogun Ceanataur", 0x4166, 86, 150], ["Terra Shogun Ceanataur", 0x418E, 87, 130]] },
    { n: "Bulldrome", card: 22, base: 566.0, mini: 98, king: 130, recs: [["Bulldrome", 0x4168, 89, 210]] },
    { n: "Congalala", card: 23, base: 984.0, mini: 97, king: 125, recs: [["Congalala", 0x4148, 93, 140], ["Emerald Congalala", 0x418A, 95, 140]] },
    { n: "Blangonga", card: 24, base: 860.0, mini: 99, king: 138, recs: [["Blangonga", 0x4146, 93, 145], ["Copper Blangonga", 0x4188, 94, 145]] },
    { n: "Rajang", card: 25, base: 960.0, mini: 105, king: 140, recs: [["Rajang", 0x414A, 95, 162], ["Golden Rajang", 0x4192, 100, 150]] },
    { n: "Kirin", card: 26, base: 464.3, mini: 97, king: 177, recs: [["Kirin", 0x4122, 95, 200]] },
    { n: "Kushala Daora", card: 27, base: 1577.0, mini: 91, king: 120, recs: [["Kushala Daora", 0x414C, 88, 138], ["Rusted Kushala Daora", 0x4158, 88, 131]] },
    { n: "Chameleos", card: 28, base: 1744.0, mini: 96, king: 141, recs: [["Chameleos", 0x4156, 95, 151]] },
    { n: "Lunastra", card: 29, base: 1740.0, mini: 91, king: 121, recs: [["Lunastra", 0x4160, 86, 130]] },
    { n: "Teostra", card: 30, base: 1740.0, mini: 88, king: 125, recs: [["Teostra", 0x4162, 86, 140]] },
  ];

  // ---- state -----------------------------------------------------------
  let view = null;               // DataView over the loaded save (read only)
  const openRows = new Set();    // which monster rows are expanded
  const $ = (id) => document.getElementById(id);

  // ---- helpers ---------------------------------------------------------
  function setStatus(msg, kind) {
    const el = $("status");
    el.textContent = msg;
    el.className = "status" + (kind ? " " + kind : "");
  }
  const u16 = (o) => view.getUint16(o, true);
  const cm  = (base, pct) => Math.round(base * pct / 100 * 10) / 10;
  const fmt = (v) => v.toFixed(1);

  function looksLikeText(dv) {
    const c0 = dv.getUint8(0), h0 = dv.getUint8(1);
    return c0 >= 0x20 && c0 <= 0x7e && h0 === 0x00;   // UTF-16LE character name at 0x00
  }
  function readName(dv) {
    let nm = "";
    for (let o = 0; o < 32; o += 2) { const ch = dv.getUint16(o, true); if (ch === 0) break; nm += String.fromCharCode(ch); }
    return nm;
  }

  // Guild-card cache read (per base species) — what the GAME actually shows.
  function cacheOf(m) {
    const b = CACHE + m.card * 8;
    return {
      tag:    u16(b),
      hunted: u16(b + 2),
      maxCm:  u16(b + 4) / 10,   // displayed largest, cm
      minCm:  u16(b + 6) / 10,   // displayed smallest, cm
    };
  }

  // Read one record (base or subspecies). Returns percents + cm, or present=false if empty (0,0).
  function readRec(m, rec) {
    const [form, off, lmin, lmax] = rec;
    const L = u16(off), S = u16(off + PAIR);
    const present = !(L === 0 && S === 0);
    return { form, off, lmin, lmax, L, S, present,
             sCm: present ? cm(m.base, S) : 0, lCm: present ? cm(m.base, L) : 0 };
  }

  // Aggregate a monster across its present records (mirrors how the guild card combines them).
  function summarize(m) {
    const recs = m.recs.map(r => readRec(m, r));
    const present = recs.filter(r => r.present);
    const cache = cacheOf(m);
    if (!present.length) {
      return { recs, present, cache, hunted: cache.hunted, minS: null, maxL: null,
               minIdx: -1, maxIdx: -1, smallCrown: false, kingCrown: false };
    }
    // min-holder = record with the smallest smallest%; max-holder = record with the largest largest%.
    let minIdx = 0, maxIdx = 0;
    recs.forEach((r, i) => {
      if (!r.present) return;
      if (!recs[minIdx].present || r.S < recs[minIdx].S) minIdx = i;
      if (!recs[maxIdx].present || r.L > recs[maxIdx].L) maxIdx = i;
    });
    const minS = recs[minIdx].S, maxL = recs[maxIdx].L;
    return {
      recs, present, cache, hunted: cache.hunted,
      minS, maxL, minIdx, maxIdx,
      smallCrown: minS <= m.mini,
      kingCrown:  maxL >= m.king,
    };
  }

  // ---- rendering: monster table ---------------------------------------
  function crownCell(s) {
    if (s.minS === null) return '<span class="dash">&mdash;</span>';
    const parts = [];
    if (s.smallCrown) parts.push('<span class="badge gold">min</span>');
    if (s.kingCrown)  parts.push('<span class="badge gold2">max</span>');
    return parts.length ? parts.join("") : '<span class="dash">none</span>';
  }

  function detailTable(m, s) {
    const rows = m.recs.map((rec, i) => {
      const r = s.recs[i];
      const isBase = i === 0;
      const cls = isBase ? "base" : "subsp";
      if (!r.present) {
        return `<tr class="${cls}"><td class="form">${rec[0]}</td>
          <td class="num muted">&mdash;</td><td class="num muted">&mdash;</td>
          <td><span class="badge hiddent">no record</span></td><td class="muted">not recorded</td></tr>`;
      }
      const smallTag = (i === s.minIdx) ? '<span class="badge shown">shown min</span>' : "";
      const largeTag = (i === s.maxIdx) ? '<span class="badge shown">shown max</span>' : "";
      const shownAny = smallTag || largeTag;
      const tag = shownAny ? (smallTag + " " + largeTag).trim() : '<span class="badge hiddent">hidden</span>';
      // Notes: hidden records that are themselves crown-sized (data the card never reveals).
      const notes = [];
      if (i !== s.minIdx && r.S <= m.mini) notes.push('<span class="badge gold">hidden min-size</span>');
      if (i !== s.maxIdx && r.L >= m.king) notes.push('<span class="badge gold2">hidden max-size</span>');
      return `<tr class="${cls}">
        <td class="form">${rec[0]}</td>
        <td class="num">${r.S}% <span class="muted">${fmt(r.sCm)}cm</span></td>
        <td class="num">${r.L}% <span class="muted">${fmt(r.lCm)}cm</span></td>
        <td>${tag}</td>
        <td>${notes.join(" ") || ""}</td>
      </tr>`;
    }).join("");
    return `<div class="detailwrap">
      <table class="rectbl">
        <thead><tr><th>Form</th><th class="num">Smallest</th><th class="num">Largest</th><th>On card</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="note" style="margin-top:10px">
        Card shows <strong>${s.hunted}</strong> hunted &middot;
        ${s.minS === null ? "no size recorded yet."
          : `smallest <strong>${fmt(s.cache.minCm)}cm</strong> (${s.minS}%),
             largest <strong>${fmt(s.cache.maxCm)}cm</strong> (${s.maxL}%).`}
        ${m.recs.length > 1 ? " The other record(s) above are stored but never shown in-game." : ""}
      </p>
    </div>`;
  }

  function renderTable() {
    const html = MONS.map((m, i) => {
      const s = summarize(m);
      const open = openRows.has(i);
      const nh = s.minS === null;
      const sub = m.recs.length > 1 ? `<span class="subcount">+${m.recs.length - 1} sub</span>` : "";
      const smallStr = nh ? '<span class="muted">&mdash;</span>' : `${fmt(s.cache.minCm)}cm <span class="muted">${s.minS}%</span>`;
      const largeStr = nh ? '<span class="muted">&mdash;</span>' : `${fmt(s.cache.maxCm)}cm <span class="muted">${s.maxL}%</span>`;
      const mainRow = `<tr class="mrow${open ? " open" : ""}${nh ? " nothunted" : ""}" data-i="${i}">
        <td><span class="caret">&#9656;</span></td>
        <td class="cardno">${m.card}</td>
        <td class="mname">${m.n}${sub}</td>
        <td class="num">${s.hunted}</td>
        <td class="num">${smallStr}</td>
        <td class="num">${largeStr}</td>
        <td class="crowncell">${crownCell(s)}</td>
      </tr>`;
      const detailRow = open
        ? `<tr class="detail"><td colspan="7">${detailTable(m, s)}</td></tr>`
        : "";
      return mainRow + detailRow;
    }).join("");
    $("tbody").innerHTML = html;
    document.querySelectorAll(".mrow").forEach(tr =>
      tr.addEventListener("click", () => {
        const i = +tr.dataset.i;
        if (openRows.has(i)) openRows.delete(i); else openRows.add(i);
        renderTable();
      }));
  }

  // ---- load (read only) ------------------------------------------------
  function loadBuffer(buf, name) {
    if (buf.byteLength !== EXPECT) {
      setStatus(`Rejected: ${buf.byteLength.toLocaleString()} bytes, expected ${EXPECT.toLocaleString()}. Not a decrypted MHP2G save.`, "bad");
      $("main").classList.add("hidden"); return;
    }
    const dv = new DataView(buf);
    if (!looksLikeText(dv)) {
      setStatus("Rejected: file looks still-encrypted. Decrypt it first (PPSSPP / SaveTools).", "bad");
      $("main").classList.add("hidden"); return;
    }
    view = dv;
    openRows.clear();
    $("main").classList.remove("hidden");
    $("charname").textContent = readName(dv) || "(unnamed)";
    renderTable();
    setStatus(`Loaded "${readName(dv)}" — read-only, your file is untouched.`, "ok");
  }

  // ---- tabs ------------------------------------------------------------
  function initTabs() {
    document.querySelectorAll(".tab").forEach(btn =>
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b === btn));
        const t = btn.dataset.tab;
        document.querySelectorAll(".tabpane").forEach(p =>
          p.classList.toggle("hidden", p.id !== "pane-" + t));
      }));
  }

  // ---- file wiring -----------------------------------------------------
  function handleFile(file) {
    const r = new FileReader();
    r.onload = () => loadBuffer(r.result, file.name);
    r.onerror = () => setStatus("Could not read the file.", "bad");
    r.readAsArrayBuffer(file);
  }
  const drop = $("drop"), fileInput = $("file");
  drop.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });
  ["dragenter", "dragover"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.add("hover"); }));
  ["dragleave", "drop"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.remove("hover"); }));
  drop.addEventListener("drop", ev => { const f = ev.dataTransfer.files[0]; if (f) handleFile(f); });

  initTabs();
})();
