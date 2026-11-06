// Claude Purple: recolours the Claude desktop app with the palette of the VS Code
// "Modern Purple Theme Dark" by nataliefruitema. Colours only; nothing else changes.
// Run in the page's DevTools console. It only overrides colour values, using a
// constructable stylesheet, and is undone by a reload. Safe to run twice.
(() => {
  const css = `html, .cds-root, .dframe-root, [data-theme], [data-mode], [style*="--cds-"], [style*="--terminal-"], [style*="--df-"] {
    --cds-surface-0: #0d0225 !important;
    --cds-surface-1: #0f032b !important;
    --cds-surface-2: #1b1133 !important;
    --cds-surface-3: #342f42 !important;
    --cds-surface-popover: #1b1133 !important;
    --cds-text-primary: #e2e2e2 !important;
    --cds-text-secondary: #9a9af0 !important;
    --cds-text-muted: #8a84a8 !important;
    --cds-fizzy-lake-color-placeholder: #b8b8f8 !important;
    --cds-text-accent: #82aaff !important;
    --cds-text-danger: #ff5370 !important;
    --cds-text-success: #c3e88d !important;
    --cds-text-warning: #ffcb6b !important;
    --cds-text-pro: #c792ea !important;
    --cds-border: #6471e423 !important;
    --cds-border-line: #6471e454 !important;
    --cds-border-accent: #375dda !important;
    --cds-fill-primary: #e2e2e2 !important;
    --cds-on-primary: #0d0225 !important;
    --cds-fill-accent: #375dda !important;
    --cds-fill-accent-hover: #4c6fe0 !important;
    --cds-fill-danger: #e85c71 !important;
    --cds-fill-danger-hover: #d94f64 !important;
    --cds-fill-secondary-layer: #6471e423 !important;
    --cds-bg-neutral-hover: #6471e423 !important;
    --cds-tooltip-bg: #342f42 !important;
    --static-sidebar-dark-page-share: 100% !important;
    --df-bg-page-hsl: 258 87% 9% !important;
    --df-sidebar-bg: #0d0225 !important;
    --df-web-sidebar-bg: #0d0225 !important;
    --cds-fizzy-lake-color-sidebar: #0d0225 !important;
    --df-sidebar-tint: #0d0225 !important;
    --df-sidebar-tint-share: 100% !important;
    --df-selected: #4c0bd88c !important;
    --df-hover: #6471e42e !important;
    --df-surface-primary: 258 87% 9% !important;
    --df-z0: 259 89.7% 7.6% !important;
    --df-z1: 258 87% 9% !important;
    --df-z2: 258 50% 13.3% !important;
    --df-z3: 256 16.8% 22.2% !important;
    --df-z4: 258 30% 28% !important;
    --df-z5: 258 25% 38% !important;
    --bg-000: 256 16.8% 22.2% !important;
    --bg-100: 258 50% 13.3% !important;
    --bg-200: 258 87% 9% !important;
    --bg-300: 259 89.7% 7.6% !important;
    --bg-400: 259 90% 5% !important;
    --bg-500: 259 90% 5% !important;
    --text-000: 0 0% 100% !important;
    --text-100: 0 0% 88.6% !important;
    --text-200: 240 73% 77.3% !important;
    --text-300: 240 73% 77.3% !important;
    --text-400: 250 17.7% 58.8% !important;
    --text-500: 250 17.7% 58.8% !important;
    --border-100: 258 40% 70% !important;
    --border-200: 258 40% 70% !important;
    --border-300: 258 40% 70% !important;
    --border-400: 258 40% 70% !important;
    --accent-brand: 351 75.4% 63.5% !important;
    --brand-000: 351 75.4% 63.5% !important;
    --brand-100: 351 75.4% 63.5% !important;
    --brand-200: 351 75.4% 63.5% !important;
    --cds-prose-code-color: #fc8fd8 !important;
    --cds-editor-code-ink: #fc8fd8 !important;
    --code-chip-ink: #fc8fd8 !important;
    --prompt-code-fg: #fc8fd8 !important;
    --prompt-code-bg: #1b1133 !important;
    --code-theme-bg: #1b1133 !important;
    --code-theme-dark-bg: #1b1133 !important;
    --code-theme-dark-fg: #9a9af0 !important;
    --code-theme-dark-line-number-fg: #616769 !important;
    --diffs-addition-color-override: #c3e88d !important;
    --diffs-deletion-color-override: #ff5370 !important;
    --diffs-modified-color-override: #c792ea !important;
    --diff-widget-bg: #1b1133 !important;
    --diff-widget-border: #342f42 !important;
    --diff-widget-fg: #9a9af0 !important;
    --diff-widget-muted: #8a84a8 !important;
    --cds-bg-highlight: #42335f !important;
    --cds-text-tint-red: #ff5370 !important;
    --cds-text-tint-orange: #f78c6c !important;
    --cds-text-tint-yellow: #ffcb6b !important;
    --cds-text-tint-green: #c3e88d !important;
    --cds-text-tint-aqua: #89ddff !important;
    --cds-text-tint-blue: #82aaff !important;
    --cds-text-tint-violet: #c792ea !important;
    --cds-text-tint-magenta: #fc8fd8 !important;
  }
  [style*="--terminal-bg"] { --terminal-bg: #0f032b !important; --terminal-fg: #9a9af0 !important; background-color: #0f032b !important; }
  .xterm, .xterm-viewport, .xterm-screen { background-color: transparent !important; }
  /* Tokyo Night token colours (the app's code theme) mapped to Modern Purple by role. */
  span[style*="#bb9af7" i] { color: #ad6dd8 !important; }
  span[style*="#9d7cd8" i] { color: #c792ea !important; }
  span[style*="#9ece6a" i] { color: #a9cf6f !important; }
  span[style*="#ff9e64" i] { color: #f78c6c !important; }
  span[style*="#7aa2f7" i] { color: #82aaff !important; }
  span[style*="#61bdf2" i] { color: #82aaff !important; }
  span[style*="#6d91de" i] { color: #82aaff !important; }
  span[style*="#c0caf5" i] { color: #fc8fd8 !important; }
  span[style*="#e0af68" i] { color: #fc8fd8 !important; }
  span[style*="#ba3c97" i] { color: #fc8fd8 !important; }
  span[style*="#2ac3de" i] { color: #b2ccd6 !important; }
  span[style*="#0db9d7" i] { color: #ff67a1 !important; }
  span[style*="#73daca" i] { color: #c792ea !important; }
  span[style*="#f7768e" i] { color: #f07178 !important; }
  span[style*="#fc7b7b" i] { color: #f07178 !important; }
  span[style*="#7dcfff" i] { color: #89ddff !important; }
  span[style*="#89ddff" i] { color: #89ddff !important; }
  span[style*="#b4f9f8" i] { color: #89ddff !important; }
  span[style*="#9abdf5" i] { color: #89ddff !important; }
  span[style*="#51597d" i] { color: #616769 !important; }
  span[style*="#565f89" i] { color: #616769 !important; }
  span[style*="#5a638c" i] { color: #616769 !important; }
  span[style*="#444b6a" i] { color: #616769 !important; }
  span[style*="#646e9c" i] { color: #616769 !important; }
  span[style*="#4e5579" i] { color: #8a84a8 !important; }
  span[style*="#747ca1" i] { color: #8a84a8 !important; }
  span[style*="#9aa5ce" i] { color: #9a9af0 !important; }
  span[style*="#a9b1d6" i] { color: #9a9af0 !important; }
  span[style*="#c0cefc" i] { color: #e2e2e2 !important; }
  span[style*="#de5971" i] { color: #ff5370 !important; }
  span[style*="#ff5370" i] { color: #ff5370 !important; }
  span[style*="#914c54" i] { color: #ff5370 !important; }
  span[style*="#449dab" i] { color: #c3e88d !important; }
  span[style*="#6183bb" i] { color: #c792ea !important; }
  /* Placeholder text, brighter. */
  html body ::placeholder, html body [data-placeholder]::before, html body .tiptap p.is-editor-empty:first-child::before, html body .ProseMirror p.is-empty:first-child::before, html body .ProseMirror p.is-editor-empty::before, html body .ProseMirror p.is-empty::before { color: #b8b8f8 !important; opacity: 1 !important; }
  /* Sidebar section headers: bold, solid purple. */
  html body [data-sidebar-group-label] [data-group-toggle], html body [data-sidebar-group-label] [data-group-toggle] * { color: #c792ea !important; font-weight: 700 !important; opacity: 1 !important; }
  html body input::placeholder, html body textarea::placeholder { color: #b8b8f8 !important; opacity: 1 !important; }
  /* macOS draws the sidebar transparent over its grey frosted-glass backdrop; paint it solid. */
  html[data-sidebar-vibrancy] .dframe-root .dframe-sidebar, html .dframe-root[data-variant] .dframe-sidebar { background-image: none !important; background-color: #0d0225 !important; }
  .hljs-comment, .hljs-quote { color: #616769 !important; }
  .hljs-keyword, .hljs-selector-tag, .hljs-doctag, .hljs-meta .hljs-keyword { color: #ad6dd8 !important; }
  .hljs-string, .hljs-symbol, .hljs-template-tag { color: #a9cf6f !important; }
  .hljs-number, .hljs-literal, .hljs-bullet { color: #f78c6c !important; }
  .hljs-title, .hljs-section, .hljs-function .hljs-title { color: #82aaff !important; }
  .hljs-variable, .hljs-template-variable, .hljs-params { color: #fc8fd8 !important; }
  .hljs-type, .hljs-class .hljs-title { color: #ff67a1 !important; }
  .hljs-built_in, .hljs-builtin-name { color: #b2ccd6 !important; }
  .hljs-attr, .hljs-attribute, .hljs-property { color: #c792ea !important; }
  .hljs-name, .hljs-tag, .hljs-link { color: #f07178 !important; }
  .hljs-selector-class { color: #f7c05a !important; }
  .hljs-selector-id, .hljs-selector-pseudo, .hljs-regexp, .hljs-meta { color: #89ddff !important; }
  .hljs-addition { color: #c3e88d !important; }
  .hljs-deletion { color: #ff5370 !important; }
`;

  // Finds neutral greys the app defines, including styles loaded later for menus and
  // dialogs, and shifts only their hue. Lightness is kept, so contrast stays the same.
  const SKIP_SELECTOR = /light|print/i;
  const SKIP_NAME = /always|shadow|scrim|overlay|font|size|width|radius|-z-/i;
  const parse = v => {
    v = v.trim();
    let m;
    if ((m = /^#([0-9a-f]{3,8})$/i.exec(v))) {
      let h = m[1];
      if (h.length === 3 || h.length === 4) h = [...h].map(c => c + c).join('');
      if (h.length === 8 && h.slice(6).toLowerCase() !== 'ff') return null;
      if (h.length !== 6 && h.length !== 8) return null;
      return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16));
    }
    if ((m = /^rgb\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)\s*\)$/i.exec(v))) return [+m[1], +m[2], +m[3]];
    return null;
  };
  const triple = v => {
    const m = /^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/.exec(v.trim());
    return m ? { s: +m[2], l: +m[3] } : null;
  };
  const shift = l => (l > 55 ? `240 ${l > 92 ? 12 : 45}% ${l}%` : l > 35 ? `250 30% ${l}%` : `258 ${l < 4 ? 80 : 55}% ${Math.max(l, 3)}%`);
  const recolour = v => {
    const t = triple(v);
    if (t) return t.s <= 18 ? shift(t.l) : null;
    const rgb = parse(v);
    if (!rgb) return null;
    const max = Math.max(...rgb) / 255, min = Math.min(...rgb) / 255, l = (max + min) / 2;
    const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
    if (s > 0.12 || l >= 0.98) return null;
    const [h, sat, lit] = shift(Math.round(l * 1000) / 10).split(' ');
    return `hsl(${h}, ${sat}, ${lit})`;
  };
  const build = doc => {
    const vars = new Map(), rules = [];
    const PROPS = ['background-color', 'color', 'border-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'outline-color', 'fill', 'stroke'];
    const walk = list => {
      for (const r of list) {
        if (r.cssRules && !r.selectorText) {
          if (!(r.conditionText && SKIP_SELECTOR.test(r.conditionText))) walk(r.cssRules);
          continue;
        }
        if (!r.selectorText || SKIP_SELECTOR.test(r.selectorText)) continue;
        const decl = [];
        for (const p of r.style) {
          const value = r.style.getPropertyValue(p);
          if (p.startsWith('--')) {
            if (!SKIP_NAME.test(p)) { const c = recolour(value); if (c) vars.set(p, c); }
          } else if (PROPS.includes(p)) {
            const c = recolour(value);
            if (c) decl.push(`${p}: ${c} !important`);
          }
        }
        if (decl.length) rules.push(`${r.selectorText} { ${decl.join('; ')} }`);
      }
    };
    for (const sheet of doc.styleSheets) { try { walk(sheet.cssRules); } catch {} }
    const block = [...vars].map(([k, v]) => `${k}: ${v} !important;`).join(' ');
    return `html, .cds-root, .dframe-root, [data-theme], [data-mode], [style*="--cds-"], [style*="--terminal-"], [style*="--df-"] { ${block} }\n${rules.join('\n')}\n${css}`;
  };
  const apply = doc => {
    try {
      const win = doc.defaultView;
      if (!doc.__modernPurple || !doc.__modernPurple.replaceSync) {
        doc.__modernPurple = new win.CSSStyleSheet();
        doc.adoptedStyleSheets = [...doc.adoptedStyleSheets, doc.__modernPurple];
      }
      doc.__modernPurple.replaceSync(doc.documentElement.dataset.mode === 'light' ? '' : build(doc));
      window.__modernPurpleError = '';
    } catch (e) { window.__modernPurpleError = String(e && e.stack || e).slice(0, 400); }
  };
  const applyAll = () => {
    apply(document);
    document.querySelectorAll('iframe').forEach(f => {
      try { if (f.contentDocument && f.contentDocument.location.origin === location.origin) apply(f.contentDocument); } catch {}
    });
  };
  // Code blocks and diffs are drawn inside <diffs-container> shadow roots, which page
  // styles can't reach, so each one gets its own small colour sheet.
  const shadowCss = css.split('\n').filter(l => l.includes('span[style*=')).join('\n') +
    '\n  pre { background-color: #1b1133 !important; }\n  [data-column-number], [data-line-number] { color: #616769 !important; }';
  const shadowDone = new WeakSet();
  const applyShadows = () => {
    document.querySelectorAll('diffs-container').forEach(host => {
      const root = host.shadowRoot;
      if (!root) return;
      try {
        if (!root.__modernPurple) { root.__modernPurple = new CSSStyleSheet(); root.adoptedStyleSheets = [...root.adoptedStyleSheets, root.__modernPurple]; }
        if (!shadowDone.has(root)) { root.__modernPurple.replaceSync(shadowCss); shadowDone.add(root); }
      } catch (e) { window.__modernPurpleError = 'shadow: ' + e; }
    });
  };
  applyShadows();
  if (window.__modernPurpleShadowWatcher) window.__modernPurpleShadowWatcher.disconnect();
  {
    let t = 0;
    window.__modernPurpleShadowWatcher = new MutationObserver(() => {
      if (t) return;
      t = setTimeout(() => { t = 0; applyShadows(); }, 300);
    });
    window.__modernPurpleShadowWatcher.observe(document.body, { childList: true, subtree: true });
  }  applyAll();
  // Menus and dialogs can load their styles on first use, so re-check when styles are added.
  // Each run replaces the previous run's watchers, so an older version can never
  // re-apply its own outdated colours later.
  if (window.__modernPurpleWatcher) window.__modernPurpleWatcher.disconnect();
  {
    let count = document.styleSheets.length, timer = 0;
    window.__modernPurpleWatcher = new MutationObserver(() => {
      if (document.styleSheets.length === count || timer) return;
      timer = setTimeout(() => { timer = 0; count = document.styleSheets.length; applyAll(); }, 400);
    });
    window.__modernPurpleWatcher.observe(document.head, { childList: true, subtree: true });
  }
  return 'modern-purple applied';
})();
