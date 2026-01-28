```css
/* [ÄNDERUNG/MARKER 1] RESET + BASELINE (mobile-first, robust) */
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
body { margin: 0; }
img, picture, video, canvas, svg { display: block; max-width: 100%; }
input, button, textarea, select { font: inherit; color: inherit; }
a { color: inherit; text-decoration: none; }
button { cursor: pointer; }
:where(button, [type="button"], [type="submit"], [role="button"]) { -webkit-tap-highlight-color: transparent; }
:where(ul, ol) { padding: 0; margin: 0; list-style: none; }
:where(p, h1, h2, h3, h4, h5, h6) { margin: 0; }
:where(hr) { border: 0; border-top: 1px solid rgba(255,255,255,.08); margin: 16px 0; }
:where(:focus) { outline: none; }

/* [ÄNDERUNG/MARKER 2] DESIGN TOKENS (CSS-Variablen) */
:root{
  /* Typography */
  --font-sans: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

  --text-xs: 0.8125rem; /* 13px */
  --text-sm: 0.9375rem; /* 15px */
  --text-md: 1rem;      /* 16px */
  --text-lg: 1.125rem;  /* 18px */
  --text-xl: 1.375rem;  /* 22px */
  --text-2xl: 1.75rem;  /* 28px */
  --text-3xl: 2.125rem; /* 34px */

  --lh-tight: 1.15;
  --lh-base: 1.55;

  /* Spacing */
  --space-1: 6px;
  --space-2: 10px;
  --space-3: 14px;
  --space-4: 18px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 40px;

  /* Radius */
  --r-xs: 10px;
  --r-sm: 14px;
  --r-md: 18px;
  --r-lg: 22px;
  --r-xl: 28px;

  /* Shadows / Glow */
  --shadow-1: 0 10px 30px rgba(0,0,0,.35);
  --shadow-2: 0 18px 50px rgba(0,0,0,.45);
  --glow-soft: 0 0 0 1px rgba(255,255,255,.06), 0 0 40px rgba(118,106,255,.08);

  /* Colors */
  --bg-0: #070712;         /* deepest */
  --bg-1: #0b0b19;         /* app base */
  --bg-2: #0f1023;         /* panels */
  --bg-3: rgba(255,255,255,.06); /* subtle */
  --fg-0: rgba(255,255,255,.92);
  --fg-1: rgba(255,255,255,.80);
  --fg-2: rgba(255,255,255,.62);
  --fg-3: rgba(255,255,255,.42);

  --border-0: rgba(255,255,255,.10);
  --border-1: rgba(255,255,255,.14);
  --border-2: rgba(118,106,255,.25);

  --brand: #7a6cff;
  --brand-2: #59d2ff;
  --brand-3: #a78bfa;

  --ok: #31d58c;
  --bad: #ff4d6d;
  --hint: #f7c948;
  --solution: #5bd0ff;
  --info: #a78bfa;

  --warn: #ffb020;

  /* Surfaces */
  --card-bg: rgba(16, 18, 42, .66);
  --card-bg-strong: rgba(16, 18, 42, .78);
  --card-border: rgba(255,255,255,.10);
  --card-border-soft: rgba(255,255,255,.08);

  /* Backdrop / overlay settings */
  --backdrop-blur: 14px;
  --backdrop-sat: 140%;

  /* Background GIF intensity (tune these if needed) */
  --gif-opacity: .12; /* low visibility “transparent” effect */
  --gif-contrast: 110%;
  --gif-saturate: 90%;
  --gif-brightness: 85%;
  --gif-blur: 0px;

  /* Layout */
  --sidebar-w: 300px;
  --topbar-h: 64px;

  /* Focus */
  --focus: 0 0 0 3px rgba(122,108,255,.32), 0 0 0 1px rgba(255,255,255,.22);

  /* Transitions */
  --t-fast: 120ms;
  --t-med: 180ms;
  --t-slow: 260ms;
  --ease: cubic-bezier(.2,.8,.2,1);
}

/* [ÄNDERUNG/MARKER 3] BODY + GLOBAL BACKGROUND (GIF + overlay layers, readable) */
html, body { height: 100%; }
body{
  font-family: var(--font-sans);
  font-size: var(--text-md);
  line-height: var(--lh-base);
  color: var(--fg-0);
  background: var(--bg-1);
  overflow-x: hidden;
  position: relative;
}

/* Layer stack:
   1) base gradient
   2) GIF (very low opacity via pseudo element)
   3) readability overlay (dark glass)
*/
body::before{
  content:"";
  position: fixed;
  inset: 0;
  z-index: -3;
  background:
    radial-gradient(1200px 800px at 15% 10%, rgba(122,108,255,.18), transparent 60%),
    radial-gradient(900px 700px at 90% 20%, rgba(89,210,255,.12), transparent 55%),
    radial-gradient(1000px 900px at 50% 90%, rgba(167,139,250,.10), transparent 60%),
    linear-gradient(180deg, var(--bg-0), var(--bg-1));
}

body::after{
  /* this ::after is reserved as the GIF layer; overlay is on .layout via its own pseudo */
  content:"";
  position: fixed;
  inset: -2px;
  z-index: -2;
  background-image: url("../img/Fakebilder_Shoah.gif");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
  opacity: var(--gif-opacity);
  filter: contrast(var(--gif-contrast)) saturate(var(--gif-saturate)) brightness(var(--gif-brightness)) blur(var(--gif-blur));
  transform: translateZ(0);
  will-change: opacity;
  pointer-events: none;
}

/* [ÄNDERUNG/MARKER 4] PREFERS-REDUCED-MOTION (ruhiger Hintergrund + weniger Transition) */
@media (prefers-reduced-motion: reduce){
  :root{
    --t-fast: 0ms;
    --t-med: 0ms;
    --t-slow: 0ms;
    --gif-opacity: .08;
    --gif-blur: 1px;
    --gif-brightness: 78%;
    --gif-saturate: 75%;
  }
  *{
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
  body::after{
    /* Keep visually calm: “fix” attachment & reduce motion impact.
       Note: GIF still animates, but appears subdued & stable. */
    background-attachment: fixed;
  }
}

/* [ÄNDERUNG/MARKER 5] ACCESSIBILITY: focus-visible, selection, reduced hover reliance */
::selection{ background: rgba(122,108,255,.35); color: var(--fg-0); }
:where(a, button, input, textarea, select, summary, .nav__item, .btn, .icon-btn):focus-visible{
  outline: none;
  box-shadow: var(--focus);
  border-radius: var(--r-sm);
}
:where(a):focus-visible{ border-radius: 10px; }

/* [ÄNDERUNG/MARKER 6] LAYOUT (Topbar + Sidebar + Main) */
.layout{
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: var(--topbar-h) 1fr;
  gap: var(--space-4);
  padding: var(--space-4);
  position: relative;
}

/* readability overlay lives on layout so cards stay crisp */
.layout::before{
  content:"";
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(180deg, rgba(7,7,18,.82), rgba(7,7,18,.68) 35%, rgba(7,7,18,.80));
  pointer-events: none;
}

.topbar{
  grid-column: 1 / -1;
  grid-row: 1;
  height: var(--topbar-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: 0 var(--space-4);
  border-radius: var(--r-lg);
  background: rgba(15, 16, 35, .68);
  border: 1px solid var(--border-0);
  box-shadow: var(--glow-soft), var(--shadow-1);
  backdrop-filter: blur(var(--backdrop-blur)) saturate(var(--backdrop-sat));
  -webkit-backdrop-filter: blur(var(--backdrop-blur)) saturate(var(--backdrop-sat));
}

.sidebar{
  grid-row: 2;
  border-radius: var(--r-lg);
  background: rgba(15, 16, 35, .60);
  border: 1px solid var(--border-0);
  box-shadow: var(--glow-soft), var(--shadow-1);
  backdrop-filter: blur(var(--backdrop-blur)) saturate(var(--backdrop-sat));
  -webkit-backdrop-filter: blur(var(--backdrop-blur)) saturate(var(--backdrop-sat));
  padding: var(--space-4);
  position: relative;
}

.main{
  grid-row: 2;
  border-radius: var(--r-lg);
  background: rgba(15, 16, 35, .45);
  border: 1px solid rgba(255,255,255,.08);
  box-shadow: var(--shadow-1);
  backdrop-filter: blur(calc(var(--backdrop-blur) - 4px)) saturate(120%);
  -webkit-backdrop-filter: blur(calc(var(--backdrop-blur) - 4px)) saturate(120%);
  padding: var(--space-4);
  min-width: 0;
}

/* desktop layout */
@media (min-width: 980px){
  .layout{
    grid-template-columns: var(--sidebar-w) 1fr;
    grid-template-rows: var(--topbar-h) 1fr;
    align-items: start;
  }
  .sidebar{
    grid-column: 1;
    grid-row: 2;
    position: sticky;
    top: calc(var(--space-4) + var(--topbar-h));
    max-height: calc(100vh - (var(--space-4) * 3) - var(--topbar-h));
    overflow: auto;
  }
  .main{
    grid-column: 2;
    grid-row: 2;
  }
}

/* [ÄNDERUNG/MARKER 7] TYPOGRAPHY HELPERS (headings, small text) */
.hero{
  padding: var(--space-4);
  border-radius: var(--r-lg);
  background: linear-gradient(135deg, rgba(122,108,255,.14), rgba(89,210,255,.08) 55%, rgba(167,139,250,.08));
  border: 1px solid rgba(122,108,255,.22);
  box-shadow: var(--glow-soft);
  backdrop-filter: blur(calc(var(--backdrop-blur) - 4px)) saturate(130%);
  -webkit-backdrop-filter: blur(calc(var(--backdrop-blur) - 4px)) saturate(130%);
  margin-bottom: var(--space-4);
}

.hero h1, .hero .title{
  font-size: clamp(var(--text-xl), 2.6vw, var(--text-3xl));
  line-height: var(--lh-tight);
  letter-spacing: -0.02em;
}
.hero p, .hero .subtitle{
  margin-top: var(--space-2);
  color: var(--fg-1);
  max-width: 75ch;
}

.section{
  margin: 0 0 var(--space-6);
}
.section > .section__head{
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}
.section h2, .section .h2{
  font-size: clamp(1.05rem, 1.8vw, 1.35rem);
  letter-spacing: -0.01em;
  line-height: var(--lh-tight);
}
.section .muted{ color: var(--fg-2); font-size: var(--text-sm); }

/* [ÄNDERUNG/MARKER 8] CARDS + GRID (2/3 columns responsive, glow/soft border) */
.cardsGrid{
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}
@media (min-width: 720px){
  .cardsGrid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1160px){
  .cardsGrid{ grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

.card,
.miniCard{
  border-radius: var(--r-lg);
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow: var(--glow-soft), var(--shadow-1);
  backdrop-filter: blur(var(--backdrop-blur)) saturate(var(--backdrop-sat));
  -webkit-backdrop-filter: blur(var(--backdrop-blur)) saturate(var(--backdrop-sat));
  padding: var(--space-4);
  position: relative;
  overflow: hidden;
}

/* subtle inner highlight */
.card::before,
.miniCard::before{
  content:"";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(900px 240px at 20% 0%, rgba(255,255,255,.08), transparent 55%),
    linear-gradient(180deg, rgba(255,255,255,.06), transparent 30%);
  opacity: .65;
}

.card > *{ position: relative; }
.miniCard{ padding: var(--space-3); border-radius: var(--r-md); background: rgba(16,18,42,.58); }

.card--wide{
  grid-column: 1 / -1;
  background: var(--card-bg-strong);
  border-color: rgba(255,255,255,.12);
}

.card h3, .card .h3, .miniCard h3, .miniCard .h3{
  font-size: 1.08rem;
  letter-spacing: -0.01em;
  line-height: var(--lh-tight);
}
.card p, .miniCard p{ color: var(--fg-1); margin-top: var(--space-2); }
.card .subtle, .miniCard .subtle{ color: var(--fg-2); font-size: var(--text-sm); }

/* hover should not be only signal: keep border & add shadow + slight lift */
@media (hover:hover){
  .card:hover, .miniCard:hover{
    border-color: rgba(122,108,255,.26);
    box-shadow: 0 0 0 1px rgba(122,108,255,.18), var(--shadow-2);
    transform: translateY(-1px);
    transition: transform var(--t-med) var(--ease), box-shadow var(--t-med) var(--ease), border-color var(--t-med) var(--ease);
  }
}
.card, .miniCard{
  transition: transform var(--t-med) var(--ease), box-shadow var(--t-med) var(--ease), border-color var(--t-med) var(--ease), background var(--t-med) var(--ease);
}

/* [ÄNDERUNG/MARKER 9] NAV (Sidebar navigation) */
.nav{
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0 0 var(--space-4);
}
.nav__item{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: 10px 12px;
  border-radius: var(--r-md);
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.03);
  color: var(--fg-1);
  user-select: none;
  cursor: pointer;
  transition: background var(--t-med) var(--ease), border-color var(--t-med) var(--ease), transform var(--t-med) var(--ease);
}
.nav__item:hover{
  background: rgba(122,108,255,.08);
  border-color: rgba(122,108,255,.22);
}
.nav__item[aria-current="true"],
.nav__item.is-active{
  background: rgba(122,108,255,.14);
  border-color: rgba(122,108,255,.32);
  color: var(--fg-0);
}
.nav__item .meta{
  color: var(--fg-2);
  font-size: var(--text-xs);
}

/* [ÄNDERUNG/MARKER 10] BUTTONS (primary / ghost / icon) */
.btn{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--r-md);
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.04);
  color: var(--fg-0);
  font-weight: 650;
  letter-spacing: 0.01em;
  user-select: none;
  transition: transform var(--t-fast) var(--ease), background var(--t-med) var(--ease), border-color var(--t-med) var(--ease), box-shadow var(--t-med) var(--ease);
}
.btn:active{ transform: translateY(1px); }
.btn[disabled], .btn[aria-disabled="true"]{
  opacity: .55;
  cursor: not-allowed;
}

.btn--primary{
  background: linear-gradient(135deg, rgba(122,108,255,.95), rgba(89,210,255,.65));
  border-color: rgba(122,108,255,.55);
  box-shadow: 0 10px 30px rgba(122,108,255,.18);
}
.btn--primary:hover{
  background: linear-gradient(135deg, rgba(122,108,255,1), rgba(89,210,255,.78));
  border-color: rgba(89,210,255,.55);
  box-shadow: 0 14px 38px rgba(122,108,255,.22);
}

.btn--ghost{
  background: rgba(255,255,255,.03);
  border-color: rgba(255,255,255,.14);
  color: var(--fg-0);
}
.btn--ghost:hover{
  background: rgba(255,255,255,.06);
  border-color: rgba(122,108,255,.26);
}

.icon-btn{
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.04);
  display: inline-grid;
  place-items: center;
  transition: background var(--t-med) var(--ease), border-color var(--t-med) var(--ease), transform var(--t-fast) var(--ease), box-shadow var(--t-med) var(--ease);
}
.icon-btn:hover{
  background: rgba(122,108,255,.10);
  border-color: rgba(122,108,255,.26);
  box-shadow: 0 0 0 1px rgba(122,108,255,.12);
}
.icon-btn:active{ transform: translateY(1px); }

/* [ÄNDERUNG/MARKER 11] TOOLBAR + TASK ROW (utility layouts) */
.toolbar{
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-3);
}
.taskRow{
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--space-3);
}
.taskRow > *{ min-width: 0; }

/* [ÄNDERUNG/MARKER 12] INPUTS (text, textarea, checkbox, toggle) */
.inputRow{
  display: grid;
  gap: 8px;
  margin-top: var(--space-3);
}
.label{
  font-size: var(--text-sm);
  color: var(--fg-1);
  font-weight: 650;
  letter-spacing: 0.01em;
}
.input{
  width: 100%;
  border-radius: var(--r-md);
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(5, 6, 14, .35);
  padding: 11px 12px;
  color: var(--fg-0);
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.15);
  transition: border-color var(--t-med) var(--ease), background var(--t-med) var(--ease), box-shadow var(--t-med) var(--ease);
}
.input::placeholder{ color: rgba(255,255,255,.38); }
.input:hover{
  border-color: rgba(122,108,255,.28);
}
.input:focus-visible{
  border-color: rgba(122,108,255,.45);
  box-shadow: var(--focus);
  background: rgba(5, 6, 14, .45);
}

textarea.input{
  min-height: 120px;
  resize: vertical;
}

/* checkbox group */
.checklist{
  display: grid;
  gap: 10px;
  margin-top: var(--space-3);
}
.check{
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--r-md);
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.03);
}
.check input[type="checkbox"]{
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: var(--brand);
}
.check label, .check .text{
  color: var(--fg-1);
  font-size: var(--text-sm);
}
.check .subtle{
  display: block;
  color: var(--fg-2);
  margin-top: 4px;
  font-size: var(--text-xs);
}

/* toggle (expects markup: input[type=checkbox] + .toggleTrack + .toggleThumb OR similar)
   We style a generic pattern if you use .toggle inside .check or .inputRow.
*/
.toggle{
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.toggle input[type="checkbox"]{
  position: absolute;
  opacity: 0;
  width: 1px; height: 1px;
}
.toggle .toggleTrack{
  width: 46px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.16);
  background: rgba(255,255,255,.06);
  position: relative;
  transition: background var(--t-med) var(--ease), border-color var(--t-med) var(--ease), box-shadow var(--t-med) var(--ease);
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.18);
}
.toggle .toggleThumb{
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: rgba(255,255,255,.88);
  position: absolute;
  top: 50%;
  left: 3px;
  transform: translateY(-50%);
  transition: transform var(--t-med) var(--ease), background var(--t-med) var(--ease);
  box-shadow: 0 8px 18px rgba(0,0,0,.35);
}
.toggle input[type="checkbox"]:focus-visible + .toggleTrack{
  box-shadow: var(--focus);
}
.toggle input[type="checkbox"]:checked + .toggleTrack{
  background: rgba(122,108,255,.28);
  border-color: rgba(122,108,255,.45);
}
.toggle input[type="checkbox"]:checked + .toggleTrack .toggleThumb{
  transform: translate(18px, -50%);
  background: rgba(255,255,255,.95);
}

/* [ÄNDERUNG/MARKER 13] ACCORDION (header/body) */
.accordion{
  border-radius: var(--r-lg);
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.03);
  overflow: hidden;
  margin-top: var(--space-3);
}
.accordion__header{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: 12px 14px;
  cursor: pointer;
  user-select: none;
  background: rgba(255,255,255,.03);
  border-bottom: 1px solid rgba(255,255,255,.08);
  transition: background var(--t-med) var(--ease), border-color var(--t-med) var(--ease);
}
.accordion__header:hover{
  background: rgba(122,108,255,.08);
}
.accordion__header .title{
  font-weight: 700;
  color: var(--fg-0);
  font-size: var(--text-sm);
}
.accordion__header .chev{
  color: var(--fg-2);
  transition: transform var(--t-med) var(--ease);
}
.accordion.is-open .accordion__header .chev{
  transform: rotate(180deg);
}
.accordion__body{
  padding: 14px;
  color: var(--fg-1);
  background: rgba(5, 6, 14, .18);
}

/* [ÄNDERUNG/MARKER 14] VIDEO BOX */
.videoBox{
  border-radius: var(--r-lg);
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(0,0,0,.22);
  box-shadow: var(--shadow-1);
  overflow: hidden;
  margin-top: var(--space-3);
}
.video{
  width: 100%;
  aspect-ratio: 16 / 9;
  display: block;
  border: 0;
}

/* [ÄNDERUNG/MARKER 15] CALLOUTS (warn/info + base) */
.callout{
  border-radius: var(--r-lg);
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.04);
  padding: 12px 14px;
  color: var(--fg-1);
  box-shadow: 0 0 0 1px rgba(0,0,0,.10);
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 12px;
  align-items: start;
}
.callout::before{
  content:"i";
  width: 24px;
  height: 24px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 13px;
  color: rgba(0,0,0,.85);
  background: rgba(255,255,255,.80);
  box-shadow: 0 10px 20px rgba(0,0,0,.25);
}
.callout--info{
  border-color: rgba(167,139,250,.35);
  background: rgba(167,139,250,.08);
}
.callout--info::before{
  content:"i";
  background: rgba(167,139,250,.95);
  color: rgba(8, 8, 18, .92);
}
.callout--warn{
  border-color: rgba(255,176,32,.34);
  background: rgba(255,176,32,.08);
}
.callout--warn::before{
  content:"!";
  background: rgba(255,176,32,.96);
  color: rgba(8, 8, 18, .92);
}

/* [ÄNDERUNG/MARKER 16] QUIZ / QA ITEMS + FEEDBACK (ok/bad/hint/solution/info) */
.quiz{
  display: grid;
  gap: var(--space-4);
  margin-top: var(--space-3);
}

.qa-item{
  border-radius: var(--r-lg);
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.03);
  padding: var(--space-4);
  box-shadow: 0 0 0 1px rgba(0,0,0,.12);
}
.qa-item .q{
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: var(--lh-tight);
  margin-bottom: 10px;
}
.qa-item .help{
  color: var(--fg-2);
  font-size: var(--text-sm);
  margin-top: 8px;
}

.qa-feedback,
.feedback{
  margin-top: 12px;
  border-radius: var(--r-lg);
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(0,0,0,.22);
  padding: 12px 14px;
  display: grid;
  grid-template-columns: 26px 1fr;
  gap: 12px;
  align-items: start;
  color: var(--fg-1);
}

/* base icon bubble */
.qa-feedback::before,
.feedback::before{
  content:"";
  width: 26px;
  height: 26px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: 13px;
  color: rgba(8,8,18,.92);
  background: rgba(255,255,255,.86);
  box-shadow: 0 12px 24px rgba(0,0,0,.25);
}

/* state variants via classes:
   - either add .ok/.bad/... on the feedback element
   - or parent wrapper has .ok etc and feedback picks it up
*/
.ok .qa-feedback, .qa-feedback.ok,
.ok .feedback, .feedback.ok{
  border-color: rgba(49,213,140,.40);
  background: rgba(49,213,140,.08);
}
.ok .qa-feedback::before, .qa-feedback.ok::before,
.ok .feedback::before, .feedback.ok::before{
  content:"✓";
  background: rgba(49,213,140,.92);
}

.bad .qa-feedback, .qa-feedback.bad,
.bad .feedback, .feedback.bad{
  border-color: rgba(255,77,109,.42);
  background: rgba(255,77,109,.08);
}
.bad .qa-feedback::before, .qa-feedback.bad::before,
.bad .feedback::before, .feedback.bad::before{
  content:"✕";
  background: rgba(255,77,109,.92);
}

.hint .qa-feedback, .qa-feedback.hint,
.hint .feedback, .feedback.hint{
  border-color: rgba(247,201,72,.44);
  background: rgba(247,201,72,.08);
}
.hint .qa-feedback::before, .qa-feedback.hint::before,
.hint .feedback::before, .feedback.hint::before{
  content:"?";
  background: rgba(247,201,72,.94);
}

.solution .qa-feedback, .qa-feedback.solution,
.solution .feedback, .feedback.solution{
  border-color: rgba(91,208,255,.46);
  background: rgba(91,208,255,.08);
}
.solution .qa-feedback::before, .qa-feedback.solution::before,
.solution .feedback::before, .feedback.solution::before{
  content:"★";
  background: rgba(91,208,255,.94);
}

.info .qa-feedback, .qa-feedback.info,
.info .feedback, .feedback.info{
  border-color: rgba(167,139,250,.46);
  background: rgba(167,139,250,.08);
}
.info .qa-feedback::before, .qa-feedback.info::before,
.info .feedback::before, .feedback.info::before{
  content:"i";
  background: rgba(167,139,250,.95);
}

/* feedback text spacing */
.qa-feedback p, .feedback p{ margin: 0; color: var(--fg-1); }
.qa-feedback .title, .feedback .title{
  font-weight: 800;
  color: var(--fg-0);
  margin-bottom: 4px;
}
.qa-feedback .small, .feedback .small{ font-size: var(--text-sm); color: var(--fg-2); }

/* [ÄNDERUNG/MARKER 17] PROGRESS (Sidebar progress box + bar + percent) */
.progressBox{
  border-radius: var(--r-lg);
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.03);
  padding: var(--space-4);
  box-shadow: 0 0 0 1px rgba(0,0,0,.12);
}
.progressBox .row{
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: 10px;
}
.progressBox .label{
  margin: 0;
  font-size: var(--text-sm);
}
.progressBox .percent{
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--fg-1);
}

.progressBar{
  width: 100%;
  height: 12px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(0,0,0,.24);
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.18);
}
.progressBar__fill{
  height: 100%;
  width: 0%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(122,108,255,.95), rgba(89,210,255,.70));
  box-shadow: 0 0 24px rgba(122,108,255,.18);
  transition: width var(--t-slow) var(--ease);
}

/* [ÄNDERUNG/MARKER 18] TABLE-LIKE ELEMENTS + MISC (nice defaults) */
code, pre{
  font-family: var(--font-mono);
  font-size: .92em;
}
pre{
  margin: 0;
  padding: 12px 14px;
  border-radius: var(--r-lg);
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(0,0,0,.22);
  overflow: auto;
}
kbd{
  font-family: var(--font-mono);
  font-size: .86em;
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.06);
}

/* [ÄNDERUNG/MARKER 19] SCROLLBAR (subtle, consistent) */
*{
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,.18) rgba(0,0,0,.12);
}
*::-webkit-scrollbar{ width: 10px; height: 10px; }
*::-webkit-scrollbar-track{ background: rgba(0,0,0,.10); border-radius: 999px; }
*::-webkit-scrollbar-thumb{
  background: rgba(255,255,255,.16);
  border: 2px solid rgba(0,0,0,.08);
  border-radius: 999px;
}
*::-webkit-scrollbar-thumb:hover{ background: rgba(255,255,255,.22); }

/* [ÄNDERUNG/MARKER 20] RESPONSIVE REFINEMENTS (mobile-first -> larger) */
@media (min-width: 560px){
  .layout{ padding: var(--space-5); gap: var(--space-5); }
  .topbar{ padding: 0 var(--space-5); }
  .main, .sidebar{ padding: var(--space-5); }
}

@media (max-width: 420px){
  .topbar{ padding: 0 12px; height: 60px; }
  :root{ --topbar-h: 60px; }
  .btn{ width: 100%; }
  .toolbar{ flex-direction: column; align-items: stretch; }
}

/* [ÄNDERUNG/MARKER 21] SAFETY NET: ensure readable links & states (no hover-only) */
a{
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  text-decoration-color: rgba(89,210,255,.35);
}
a:hover{
  text-decoration-color: rgba(89,210,255,.75);
}
a:visited{
  text-decoration-color: rgba(167,139,250,.45);
}

/* [ÄNDERUNG/MARKER 22] OPTIONAL: subtle separators for sections */
.section + .section{
  padding-top: var(--space-5);
  border-top: 1px solid rgba(255,255,255,.06);
}
```
