// Read-only: reads the colour of each part of the screen ("role"), so the approved look can be
// saved as a reference and compared after an app update. Changes nothing on the page.
// Result (copied to the clipboard): { role: { color, background, weight } | null }.
window.__probeResult = 'running';
(() => {
  const ownText = el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  // The element that actually draws the text: the first descendant (or itself) with its own text.
  const textEl = el => el && (ownText(el) ? el : [...el.querySelectorAll('*')].find(ownText) || el);
  const read = (sel, opts = {}) => {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return null;
    const cs = getComputedStyle(opts.bgOnly ? el : textEl(el));
    const out = {};
    if (!opts.bgOnly) { out.color = cs.color; out.weight = cs.fontWeight; }
    if (opts.bg || opts.bgOnly) out.background = getComputedStyle(el).backgroundColor;
    return out;
  };
  const root = getComputedStyle(document.documentElement);
  const roles = {
    'sidebar background': read('.dframe-sidebar', { bgOnly: true }),
    'sidebar top item (New, Search)': read('.dframe-sidebar [data-row-nav]'),
    'sidebar section header (Pinned)': read('[data-sidebar-group-label] [data-group-toggle]'),
    'sidebar session name': read('.dframe-sidebar [data-row-main-button]:not([data-row-nav]):not([aria-current])'),
    'sidebar selected session': read('.dframe-sidebar [data-row-main-button][aria-current]'),
    'sidebar selected row background': read('.dframe-sidebar [data-row][data-selected]', { bgOnly: true }),
    'page background': read('body', { bgOnly: true }),
    'page text': read('body'),
    'composer box': read('[contenteditable="true"]', { bg: true }),
    'inline code': read('code:not(pre code)', { bg: true }),
    'link / tool summary': read('main a, main button[aria-expanded]'),
  };
  // The theme's own colour values, as the app sees them now.
  const vars = {};
  for (const v of ['--cds-text-primary', '--cds-text-secondary', '--cds-text-muted', '--cds-fizzy-lake-color-placeholder', '--code-theme-dark-bg', '--df-selected', '--df-hover', '--text-100', '--text-200', '--text-400'])
    vars[v] = root.getPropertyValue(v).trim();
  window.__probeResult = JSON.stringify({ app: navigator.userAgent.match(/Claude\/[\d.]+/)?.[0] || '', roles, vars }, null, 1);
  copy(window.__probeResult);
})();
'probing';
