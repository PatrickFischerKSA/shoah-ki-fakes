/* =========================================================
   DATEI 3/3 — assets/js/app.js
   ARBEITSMODUS-KONFORM:
   - Kein Minimalismus: vollständige, robuste App-Logik
   - Keine Vereinfachung: mehrere Engines (Quiz/Router/Progress/Storage/Export)
   - Keine stillschweigenden Änderungen: alle “Änderungen/Features” als MARKER
   - Keine Platzhalter: keine TODOs, keine Demo-Strings als Pflichtinhalt
   - Keine ausgelassenen Teile: komplette Datei
   - Bei Unsicherheit: defensiv & DOM-flexibel (funktioniert mit gängigen Strukturen)
   ========================================================= */

/* =========================
   [ÄNDERUNG/MARKER 1]
   Strikter Initialisierungs-Wrapper, damit nichts “hängt”
   ========================= */
(() => {
  "use strict";

  /* =========================
     [ÄNDERUNG/MARKER 2]
     Kleine Utility-Layer: DOM, Strings, Normalisierung, Events
     ========================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const nowISO = () => new Date().toISOString();

  // Normalisierung für Synonymerkennung & “sanftes” Matching (de/fr/en tauglich)
  const normalize = (s) => {
    if (s == null) return "";
    return String(s)
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "") // diakritika raus
      .replace(/[“”„"']/g, "")
      .replace(/[–—-]/g, " ")
      .replace(/[^\p{L}\p{N}\s]/gu, " ") // nur buchstaben/zahlen/space
      .replace(/\s+/g, " ")
      .trim();
  };

  // Entfernt “Füllwörter” NICHT aggressiv (kein Minimalismus), nur sehr vorsichtig
  const softNormalize = (s) => {
    const x = normalize(s);
    // optional: sehr häufige Artikel entfernen, aber nur wenn mehrere Wörter
    const parts = x.split(" ").filter(Boolean);
    if (parts.length <= 1) return x;
    const stop = new Set(["der", "die", "das", "ein", "eine", "einer", "einem", "einen", "und", "oder", "aber"]);
    const filtered = parts.filter((p) => !stop.has(p));
    return filtered.length ? filtered.join(" ") : x;
  };

  const splitSynonyms = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(String);
    // Trennzeichen: | ; , oder Zeilenumbrüche
    return String(raw)
      .split(/\s*(\||;|,|\n)\s*/g)
      .filter((t) => t && !["|", ";", ",", "\n"].includes(t))
      .map((t) => t.trim())
      .filter(Boolean);
  };

  // Token-ähnlicher Vergleich: erlaubt leichte Variationen (Reihenfolge egal)
  const tokenSet = (s) => new Set(softNormalize(s).split(" ").filter(Boolean));
  const jaccard = (a, b) => {
    const A = tokenSet(a);
    const B = tokenSet(b);
    if (!A.size && !B.size) return 1;
    if (!A.size || !B.size) return 0;
    let inter = 0;
    for (const t of A) if (B.has(t)) inter++;
    const union = A.size + B.size - inter;
    return union ? inter / union : 0;
  };

  const safeJsonParse = (s, fallback = null) => {
    try {
      return JSON.parse(s);
    } catch {
      return fallback;
    }
  };

  /* =========================
     [ÄNDERUNG/MARKER 3]
     Zentrale Konfiguration + Storage Keys
     ========================= */
  const APP = {
    version: "1.0.0",
    storageKey: "lernlandschaft_progress_v1",
    storageKeyMeta: "lernlandschaft_meta_v1",
    maxAttempts: 3,
    // Matching-Schwellen (robust statt “streng”)
    jaccardAccept: 0.86,
  };

  /* =========================
     [ÄNDERUNG/MARKER 4]
     State + Persistenz (localStorage)
     ========================= */
  const defaultState = () => ({
    updatedAt: nowISO(),
    // pro Frage: { attempts, status: "open"|"correct", lastAnswer, history: [{t, a, ok}] }
    questions: {},
    // Navigation/Section-Status
    ui: {
      activeSectionId: null,
      lastScrollY: 0,
    },
  });

  const loadState = () => {
    const raw = localStorage.getItem(APP.storageKey);
    const parsed = safeJsonParse(raw, null);
    if (!parsed || typeof parsed !== "object") return defaultState();
    // defensive merge
    const st = defaultState();
    if (parsed.questions && typeof parsed.questions === "object") st.questions = parsed.questions;
    if (parsed.ui && typeof parsed.ui === "object") st.ui = { ...st.ui, ...parsed.ui };
    st.updatedAt = parsed.updatedAt || st.updatedAt;
    return st;
  };

  const saveState = (st) => {
    st.updatedAt = nowISO();
    try {
      localStorage.setItem(APP.storageKey, JSON.stringify(st));
      localStorage.setItem(
        APP.storageKeyMeta,
        JSON.stringify({ version: APP.version, savedAt: st.updatedAt })
      );
    } catch (e) {
      // Wenn Storage voll: trotzdem nicht crashen
      console.warn("Speichern fehlgeschlagen:", e);
    }
  };

  const clearState = () => {
    localStorage.removeItem(APP.storageKey);
    localStorage.removeItem(APP.storageKeyMeta);
  };

  const state = loadState();

  /* =========================
     [ÄNDERUNG/MARKER 5]
     DOM-Konventionen (flexibel):
     - Sections: <section data-section="intro|modul1|..."> oder id="..."
     - Quiz-Items:
         .qa-item oder [data-qa]
         Antwortfeld: input[type=text], textarea, oder [contenteditable]
         Musterlösung/Antwort: data-answer ODER <script type="application/json" class="qa-data">...</script>
         Synonyme: data-synonyms (| ; , getrennt) oder im JSON
         Hinweis: data-hint oder im JSON
       Buttons:
         .btn-check (prüfen), .btn-reset (reset), .btn-show-solution (lösung)
         Optional global: #resetAll, #exportProgress, #importProgress
     ========================= */

  /* =========================
     [ÄNDERUNG/MARKER 6]
     Router/Navi: Sections + Deep-Link via #hash
     ========================= */
  const getAllSections = () => {
    const byData = $$("section[data-section]");
    if (byData.length) return byData;
    // fallback: “module-like” sections (optional)
    const byId = $$("section[id]");
    return byId;
  };

  const getSectionId = (sec) => sec?.dataset?.section || sec?.id || null;

  const activateSection = (id, { scroll = true, pushHash = true } = {}) => {
    const sections = getAllSections();
    if (!sections.length) return;

    let target = null;
    for (const s of sections) {
      const sid = getSectionId(s);
      const isTarget = sid && sid === id;
      s.classList.toggle("is-active", !!isTarget);
      if (isTarget) target = s;
    }

    if (!target) {
      // fallback: erste section
      target = sections[0];
      target.classList.add("is-active");
      id = getSectionId(target);
    }

    state.ui.activeSectionId = id;
    saveState(state);

    if (pushHash && id) {
      // keine Endlosschleife: nur setzen wenn anders
      const newHash = `#${encodeURIComponent(id)}`;
      if (location.hash !== newHash) history.replaceState(null, "", newHash);
    }

    if (scroll && target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    updateNavActive(id);
  };

  const updateNavActive = (activeId) => {
    // Unterstützt Links: a[href="#id"] oder [data-nav="id"]
    const navLinks = $$('a[href^="#"], [data-nav]');
    navLinks.forEach((a) => {
      const href = a.getAttribute("href");
      const nav = a.dataset?.nav;
      const id = nav || (href ? decodeURIComponent(href.slice(1)) : null);
      if (!id) return;
      a.classList.toggle("active", id === activeId);
      a.setAttribute("aria-current", id === activeId ? "page" : "false");
    });
  };

  const initRouter = () => {
    const sections = getAllSections();
    if (!sections.length) return;

    // Klicks auf Navi abfangen
    on(document, "click", (e) => {
      const a = e.target.closest('a[href^="#"], [data-nav]');
      if (!a) return;
      const href = a.getAttribute("href");
      const nav = a.dataset?.nav;
      const id = nav || (href ? decodeURIComponent(href.slice(1)) : null);
      if (!id) return;
      e.preventDefault();
      activateSection(id, { scroll: true, pushHash: true });
    });

    // Hash beim Laden
    const initial = (() => {
      const h = location.hash ? decodeURIComponent(location.hash.slice(1)) : null;
      return h || state.ui.activeSectionId || getSectionId(sections[0]);
    })();

    activateSection(initial, { scroll: false, pushHash: true });

    // Hashchange (z.B. Back-Button)
    on(window, "hashchange", () => {
      const h = location.hash ? decodeURIComponent(location.hash.slice(1)) : null;
      if (h) activateSection(h, { scroll: true, pushHash: false });
    });
  };

  /* =========================
     [ÄNDERUNG/MARKER 7]
     Quiz-Engine: Items einsammeln + logische Daten
     ========================= */
  const parseQaJson = (root) => {
    const script = $(".qa-data", root);
    if (!script) return null;
    const txt = script.textContent?.trim();
    if (!txt) return null;
    return safeJsonParse(txt, null);
  };

  const getQaId = (root, index) => {
    // Priorität: data-qa-id > id > data-qa > fallback
    return (
      root.dataset.qaId ||
      root.id ||
      root.dataset.qa ||
      `qa_${index + 1}`
    );
  };

  const getAnswerField = (root) => {
    // Priorität: input/textarea, dann contenteditable
    const field = $("input[type='text'], input:not([type]), textarea", root);
    if (field) return field;
    const ce = $("[contenteditable='true']", root);
    return ce || null;
  };

  const getFeedbackBox = (root) => {
    // Unterstützt mehrere Varianten
    return (
      $(".qa-feedback", root) ||
      $(".feedback", root) ||
      root.querySelector("[data-feedback]") ||
      null
    );
  };

  const collectQuizItems = () => {
    const items = $$(".qa-item, [data-qa]");
    return items.map((root, idx) => {
      const qaJson = parseQaJson(root) || {};
      const id = getQaId(root, idx);

      const answer = root.dataset.answer || qaJson.answer || qaJson.solution || "";
      const synonymsRaw = root.dataset.synonyms || qaJson.synonyms || qaJson.accept || [];
      const hint = root.dataset.hint || qaJson.hint || "";
      const solutionText = root.dataset.solutionText || qaJson.solutionText || qaJson.model || "";

      // Optional: multiple acceptable answers as array
      const acceptable = (() => {
        const base = [];
        if (Array.isArray(answer)) base.push(...answer);
        else if (typeof answer === "string" && answer.trim()) base.push(answer.trim());
        base.push(...splitSynonyms(synonymsRaw));
        // dedupe (normalized)
        const seen = new Set();
        const out = [];
        for (const a of base) {
          const n = softNormalize(a);
          if (!n) continue;
          if (seen.has(n)) continue;
          seen.add(n);
          out.push(a);
        }
        return out;
      })();

      return {
        root,
        id,
        idx,
        field: getAnswerField(root),
        feedback: getFeedbackBox(root),
        data: {
          acceptable,
          hint,
          solutionText,
        },
      };
    });
  };

  const quizItems = collectQuizItems();

  /* =========================
     [ÄNDERUNG/MARKER 8]
     Matching-Logik: exakt / normalisiert / token-jaccard
     ========================= */
  const isCorrect = (userAnswer, acceptableList) => {
    const ua = softNormalize(userAnswer);
    if (!ua) return { ok: false, mode: "empty" };

    // 1) Exakt-normalisiert match
    for (const acc of acceptableList) {
      if (ua === softNormalize(acc)) return { ok: true, mode: "exact" };
    }

    // 2) Enthält/Teilmatch (nur wenn sehr ähnlich, nicht “zu locker”)
    for (const acc of acceptableList) {
      const an = softNormalize(acc);
      if (!an) continue;
      if (ua.length >= 6 && an.length >= 6) {
        if (ua.includes(an) || an.includes(ua)) {
          // schützt vor “zu kurzen” Zufalls-Treffern
          const score = jaccard(ua, an);
          if (score >= APP.jaccardAccept) return { ok: true, mode: "contain" };
        }
      }
    }

    // 3) Token-Set Similarity
    let best = 0;
    for (const acc of acceptableList) {
      const score = jaccard(ua, acc);
      if (score > best) best = score;
    }
    if (best >= APP.jaccardAccept) return { ok: true, mode: "token" };

    return { ok: false, mode: "nope" };
  };

  /* =========================
     [ÄNDERUNG/MARKER 9]
     UI-Feedback: falsch/hinweis/lösung nach 1/2/3 Versuch
     ========================= */
  const ensureQuestionState = (qid) => {
    if (!state.questions[qid]) {
      state.questions[qid] = {
        attempts: 0,
        status: "open",
        lastAnswer: "",
        history: [],
      };
    }
    return state.questions[qid];
  };

  const setFeedback = (item, html, type = "info") => {
    const box = item.feedback;
    if (!box) return;
    box.innerHTML = html;
    box.classList.remove("ok", "bad", "hint", "solution", "info");
    box.classList.add(type);
    box.setAttribute("role", type === "bad" ? "alert" : "status");
    box.setAttribute("aria-live", "polite");
  };

  const lockFieldIfCorrect = (item, correct) => {
    const f = item.field;
    if (!f) return;
    if (f.hasAttribute("contenteditable")) {
      f.setAttribute("contenteditable", correct ? "false" : "true");
      f.classList.toggle("is-locked", correct);
      return;
    }
    f.disabled = !!correct;
    f.classList.toggle("is-locked", !!correct);
  };

  const updateItemUIFromState = (item) => {
    const qs = ensureQuestionState(item.id);
    const isDone = qs.status === "correct";

    // Feld füllen (falls im DOM leer) – aber NICHT überschreiben, wenn Nutzer tippt
    if (item.field) {
      const current = item.field.hasAttribute("contenteditable")
        ? item.field.textContent
        : item.field.value;

      if (!current && qs.lastAnswer) {
        if (item.field.hasAttribute("contenteditable")) item.field.textContent = qs.lastAnswer;
        else item.field.value = qs.lastAnswer;
      }
    }

    lockFieldIfCorrect(item, isDone);

    // Feedback wiederherstellen: nur wenn vorhanden
    if (item.feedback) {
      if (isDone) {
        setFeedback(item, "✅ <strong>Richtig.</strong>", "ok");
      } else if (qs.attempts === 1) {
        setFeedback(item, "❌ <strong>Falsch.</strong> Versuche es noch einmal.", "bad");
      } else if (qs.attempts === 2) {
        const hint = item.data.hint ? `💡 <strong>Hinweis:</strong> ${escapeHtml(item.data.hint)}` : "💡 <strong>Hinweis:</strong> Achte auf zentrale Begriffe aus dem Material.";
        setFeedback(item, `❌ <strong>Falsch.</strong><br>${hint}`, "hint");
      } else if (qs.attempts >= 3) {
        // Wenn es keine “solutionText” gibt, zeigen wir dennoch die akzeptablen Antworten an
        const sol = item.data.solutionText?.trim()
          ? escapeHtml(item.data.solutionText.trim())
          : formatAcceptable(item.data.acceptable);
        setFeedback(item, `🧩 <strong>Musterlösung:</strong> ${sol}`, "solution");
      } else {
        // attempts 0: leer lassen
        setFeedback(item, "", "info");
      }
    }
  };

  const formatAcceptable = (accList) => {
    const clean = (accList || []).map((x) => String(x).trim()).filter(Boolean);
    if (!clean.length) return "(keine Musterlösung hinterlegt)";
    if (clean.length === 1) return `<span>${escapeHtml(clean[0])}</span>`;
    return `<ul>${clean.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul>`;
  };

  const escapeHtml = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  /* =========================
     [ÄNDERUNG/MARKER 10]
     Prüfen-Handler pro Item + globale Delegation
     ========================= */
  const readFieldValue = (field) => {
    if (!field) return "";
    if (field.hasAttribute("contenteditable")) return field.textContent || "";
    return field.value || "";
  };

  const writeFieldValue = (field, val) => {
    if (!field) return;
    if (field.hasAttribute("contenteditable")) {
      field.textContent = val ?? "";
      return;
    }
    field.value = val ?? "";
  };

  const handleCheck = (item) => {
    const qs = ensureQuestionState(item.id);
    if (qs.status === "correct") {
      setFeedback(item, "✅ <strong>Richtig.</strong> (bereits gelöst)", "ok");
      updateProgressUI();
      return;
    }

    const userAnswer = readFieldValue(item.field);
    qs.lastAnswer = userAnswer;

    const result = isCorrect(userAnswer, item.data.acceptable);

    qs.attempts = clamp(qs.attempts + 1, 0, APP.maxAttempts);
    qs.history.push({ t: nowISO(), a: userAnswer, ok: !!result.ok, mode: result.mode });

    if (result.ok) {
      qs.status = "correct";
      setFeedback(item, "✅ <strong>Richtig.</strong>", "ok");
      lockFieldIfCorrect(item, true);
    } else {
      if (qs.attempts === 1) {
        setFeedback(item, "❌ <strong>Falsch.</strong> Versuche es noch einmal.", "bad");
      } else if (qs.attempts === 2) {
        const hint = item.data.hint
          ? `💡 <strong>Hinweis:</strong> ${escapeHtml(item.data.hint)}`
          : "💡 <strong>Hinweis:</strong> Schau nochmals in die Textstelle/Quelle und arbeite mit Schlüsselbegriffen.";
        setFeedback(item, `❌ <strong>Falsch.</strong><br>${hint}`, "hint");
      } else {
        const sol = item.data.solutionText?.trim()
          ? escapeHtml(item.data.solutionText.trim())
          : formatAcceptable(item.data.acceptable);
        setFeedback(item, `🧩 <strong>Musterlösung:</strong> ${sol}`, "solution");
      }
    }

    saveState(state);
    updateProgressUI();
  };

  const handleResetItem = (item) => {
    const qs = ensureQuestionState(item.id);
    qs.attempts = 0;
    qs.status = "open";
    qs.lastAnswer = "";
    qs.history = [];
    writeFieldValue(item.field, "");
    lockFieldIfCorrect(item, false);
    setFeedback(item, "", "info");
    saveState(state);
    updateProgressUI();
  };

  const handleShowSolution = (item) => {
    const qs = ensureQuestionState(item.id);
    qs.attempts = Math.max(qs.attempts, APP.maxAttempts);
    const sol = item.data.solutionText?.trim()
      ? escapeHtml(item.data.solutionText.trim())
      : formatAcceptable(item.data.acceptable);
    setFeedback(item, `🧩 <strong>Musterlösung:</strong> ${sol}`, "solution");
    saveState(state);
    updateProgressUI();
  };

  const initQuiz = () => {
    // Initial UI state aus localStorage wiederherstellen
    quizItems.forEach(updateItemUIFromState);
    updateProgressUI();

    // Event Delegation: Buttons innerhalb eines Items
    on(document, "click", (e) => {
      const btn = e.target.closest("button, .btn");
      if (!btn) return;

      const itemRoot = btn.closest(".qa-item, [data-qa]");
      if (!itemRoot) return;

      const item = quizItems.find((x) => x.root === itemRoot);
      if (!item) return;

      // Klassen / data-action / button type unterstützen
      const action =
        btn.dataset.action ||
        (btn.classList.contains("btn-check") ? "check" : null) ||
        (btn.classList.contains("btn-reset") ? "reset" : null) ||
        (btn.classList.contains("btn-show-solution") ? "solution" : null);

      if (!action) return;

      e.preventDefault();
      if (action === "check") handleCheck(item);
      else if (action === "reset") handleResetItem(item);
      else if (action === "solution") handleShowSolution(item);
    });

    // Enter = check (bei input) pro Item
    on(document, "keydown", (e) => {
      const t = e.target;
      if (!t) return;
      if (e.key !== "Enter") return;

      // Nur in input/textarea/contenteditable, nicht in Buttons
      const isTextInput =
        t.matches?.("input[type='text'], input:not([type])") ||
        t.matches?.("textarea") ||
        t.getAttribute?.("contenteditable") === "true";

      if (!isTextInput) return;

      // in textarea: Enter zulassen (kein Submit), ausser ctrl/cmd+enter
      if (t.matches?.("textarea") && !(e.ctrlKey || e.metaKey)) return;

      const itemRoot = t.closest(".qa-item, [data-qa]");
      if (!itemRoot) return;
      const item = quizItems.find((x) => x.root === itemRoot);
      if (!item) return;

      e.preventDefault();
      handleCheck(item);
    });
  };

  /* =========================
     [ÄNDERUNG/MARKER 11]
     Fortschrittsanzeige: (gelöst/gesamt) + Progressbar + optionaler Download-Button
     ========================= */
  const getProgress = () => {
    const total = quizItems.length;
    let solved = 0;
    for (const it of quizItems) {
      const qs = ensureQuestionState(it.id);
      if (qs.status === "correct") solved++;
    }
    return { solved, total, pct: total ? Math.round((solved / total) * 100) : 0 };
  };

  const updateProgressUI = () => {
    const { solved, total, pct } = getProgress();

    // Unterstützte Targets: .progress-text, #progressText
    const textEl = $(".progress-text") || $("#progressText");
    if (textEl) textEl.textContent = `${solved}/${total}`;

    // Fortschrittsbalken: <progress> oder .progress-bar [data-progress]
    const progressEl = $("progress#progressBar") || $("progress.progress-bar");
    if (progressEl) {
      progressEl.max = total || 1;
      progressEl.value = solved;
      progressEl.setAttribute("aria-label", `Fortschritt: ${pct}%`);
    }

    const bar = $(".progress-fill, [data-progress-fill]");
    if (bar) {
      bar.style.width = `${pct}%`;
      bar.setAttribute("aria-valuenow", String(pct));
      bar.setAttribute("aria-valuemin", "0");
      bar.setAttribute("aria-valuemax", "100");
    }

    const pctEl = $(".progress-percent") || $("#progressPercent");
    if (pctEl) pctEl.textContent = `${pct}%`;

    // Optional: “Download/Export freischalten wenn alles gelöst”
    const dl = $("#downloadBtn, .download-btn, [data-download]");
    if (dl) {
      const enable = total > 0 && solved === total;
      dl.classList.toggle("is-enabled", enable);
      dl.setAttribute("aria-disabled", enable ? "false" : "true");
      if (dl.tagName === "BUTTON") dl.disabled = !enable;
    }
  };

  /* =========================
     [ÄNDERUNG/MARKER 12]
     Global Reset + Export/Import (für Abgabe/Backup)
     ========================= */
  const exportProgress = () => {
    const payload = {
      meta: { appVersion: APP.version, exportedAt: nowISO() },
      state,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `progress_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const importProgressFromFile = (file) => {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onerror = () => reject(new Error("Datei konnte nicht gelesen werden."));
      r.onload = () => {
        const parsed = safeJsonParse(String(r.result || ""), null);
        if (!parsed || !parsed.state) return reject(new Error("Ungültiges Export-Format."));
        // Übernehmen, defensiv
        const st = defaultState();
        if (parsed.state.questions) st.questions = parsed.state.questions;
        if (parsed.state.ui) st.ui = { ...st.ui, ...parsed.state.ui };
        st.updatedAt = nowISO();
        // in global state kopieren
        state.questions = st.questions;
        state.ui = st.ui;
        saveState(state);
        // UI refresh
        quizItems.forEach(updateItemUIFromState);
        updateProgressUI();
        resolve(true);
      };
      r.readAsText(file);
    });
  };

  const initGlobalControls = () => {
    // Reset all
    const resetAll = $("#resetAll, .reset-all, [data-reset-all]");
    if (resetAll) {
      on(resetAll, "click", (e) => {
        e.preventDefault();
        // Keine “Confirm-Pflicht”, aber sicher: wenn Element data-confirm nutzt, dann confirm
        const wantsConfirm = resetAll.dataset.confirm === "true";
        if (wantsConfirm) {
          const ok = confirm("Wirklich alles zurücksetzen? (Fortschritt wird gelöscht)");
          if (!ok) return;
        }
        clearState();
        // state neu laden
        const fresh = defaultState();
        state.questions = fresh.questions;
        state.ui = fresh.ui;
        saveState(state);
        // UI
        quizItems.forEach(handleResetItem);
        updateProgressUI();
      });
    }

    // Export
    const exportBtn = $("#exportProgress, .export-progress, [data-export]");
    if (exportBtn) {
      on(exportBtn, "click", (e) => {
        e.preventDefault();
        exportProgress();
      });
    }

    // Import
    const importInput = $("#importProgressInput");
    const importBtn = $("#importProgress, .import-progress, [data-import]");
    if (importBtn) {
      on(importBtn, "click", (e) => {
        e.preventDefault();
        if (importInput) importInput.click();
        else {
          // Fallback: unsichtbares Input erzeugen
          const tmp = document.createElement("input");
          tmp.type = "file";
          tmp.accept = "application/json";
          tmp.style.display = "none";
          document.body.appendChild(tmp);
          tmp.addEventListener("change", async () => {
            const file = tmp.files && tmp.files[0];
            if (!file) return;
            try {
              await importProgressFromFile(file);
            } catch (err) {
              alert(String(err?.message || err));
            } finally {
              tmp.remove();
            }
          });
          tmp.click();
        }
      });
    }
    if (importInput) {
      on(importInput, "change", async () => {
        const file = importInput.files && importInput.files[0];
        if (!file) return;
        try {
          await importProgressFromFile(file);
        } catch (err) {
          alert(String(err?.message || err));
        } finally {
          importInput.value = "";
        }
      });
    }
  };

  /* =========================
     [ÄNDERUNG/MARKER 13]
     “Sanity Checks” fürs DOM: fehlende Antworten/IDs markieren (nur Konsole)
     ========================= */
  const sanityCheck = () => {
    if (!quizItems.length) {
      console.warn("Keine Quiz-Items gefunden (.qa-item oder [data-qa]).");
      return;
    }
    for (const it of quizItems) {
      if (!it.field) console.warn(`Quiz-Item "${it.id}": kein Eingabefeld gefunden (input/textarea/contenteditable).`);
      if (!it.data.acceptable || it.data.acceptable.length === 0) {
        console.warn(`Quiz-Item "${it.id}": keine akzeptierte Antwort hinterlegt (data-answer / qa-data JSON).`);
      }
    }
  };

  /* =========================
     [ÄNDERUNG/MARKER 14]
     Initialisierung (DOMContentLoaded)
     ========================= */
  const init = () => {
    initRouter();
    initQuiz();
    initGlobalControls();
    sanityCheck();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
