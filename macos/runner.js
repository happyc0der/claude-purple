// ClaudePurple runner, run by the launcher app (which holds the Accessibility permission).
// job.txt lines: 1 mode (check | apply)  2 payload path  3 result path or "-"
//                4 allow-pasting 0/1      5 keep DevTools open 0/1
// "check" only reads window titles and types nothing.
// Safety: before every group of keys, Claude must be the front app AND its focused
// window's title must start with "Developer Tools". Otherwise it stops, so it can
// never type into Claude's main window or message box.
(() => {
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;
  const base = app.doShellScript('echo "$HOME"') + '/Library/Application Support/ClaudePurple/';
  const q = s => "'" + String(s).replace(/'/g, "'\\''") + "'";
  const log = msg => app.doShellScript('echo "$(date \'+%Y-%m-%dT%H:%M:%S\') "' + q(msg) + ' >> ' + q(base + 'apply.log'));
  const out = msg => app.doShellScript('printf "%s\\n" ' + q(msg) + ' > ' + q(base + 'check.txt'));
  const delay = s => app.doShellScript('sleep ' + s);
  const job = app.doShellScript('cat ' + q(base + 'job.txt')).split(/\r?\n|\r/);
  const mode = job[0], payload = job[1], resultPath = job[2] || '-', allowPasting = job[3] === '1', keepOpen = job[4] === '1';

  const attr = (el, name) => {
    const ref = Ref();
    if ($.AXUIElementCopyAttributeValue(el, $(name), ref) !== 0) return null;
    return ref[0];
  };
  const str = v => { try { const o = ObjC.castRefToObject(v); return o && o.js !== undefined ? String(o.js) : null; } catch (e) { return null; } };
  const claudeApp = () => {
    const apps = $.NSRunningApplication.runningApplicationsWithBundleIdentifier($('com.anthropic.claudefordesktop')).js;
    return apps.length ? apps[0] : null;
  };
  const frontIsClaude = () => $.NSWorkspace.sharedWorkspace.frontmostApplication.bundleIdentifier.js === 'com.anthropic.claudefordesktop';
  const windows = axApp => {
    const list = attr(axApp, 'AXWindows');
    if (!list) return [];
    return ObjC.castRefToObject(list).js.map(w => ({ el: w, title: str(attr(w, 'AXTitle')) || '' }));
  };
  const focusedTitle = axApp => { const w = attr(axApp, 'AXFocusedWindow'); return w ? (str(attr(ObjC.castRefToObject(w), 'AXTitle')) || '') : ''; };
  const isDev = t => t.indexOf('Developer Tools') === 0 && t.indexOf('claude.ai') !== -1; // only Claude's own page

  const trusted = $.AXIsProcessTrusted();
  const ca = claudeApp();
  if (!trusted) { log('stop: Accessibility permission is off for ClaudePurple'); out('trusted=false'); return 'no permission'; }
  if (!ca) { log('skip: Claude is not running'); out('claude not running'); return 'no claude'; }
  const axApp = $.AXUIElementCreateApplication(ca.processIdentifier);

  if (mode === 'check') {
    try {
    const wins = windows(axApp).map(w => w.title);
    const front = $.NSWorkspace.sharedWorkspace.frontmostApplication.localizedName.js;
    const focused = focusedTitle(axApp);
    out(JSON.stringify({ trusted: true, front, windows: wins, focused }));
    } catch (e) { log('error in check: ' + e); return 'error'; }
    log('check done');
    return 'checked';
  }

  if (mode === 'show') {
    const w = windows(axApp).find(x => isDev(x.title));
    if (!w) { out('no devtools window'); return 'none'; }
    ca.activateWithOptions(1);
    $.AXUIElementPerformAction(w.el, $('AXRaise'));
    const pos = attr(w.el, 'AXPosition'), size = attr(w.el, 'AXSize');
    out('raised: ' + w.title.slice(0, 60) + ' minimized=' + str(attr(w.el, 'AXMinimized')));
    return 'shown';
  }
  const CMD = 0x100000, SHIFT = 0x20000, OPT = 0x80000;
  const key = (code, flags) => {
    for (const down of [true, false]) {
      const e = $.CGEventCreateKeyboardEvent(null, code, down);
      $.CGEventSetFlags(e, flags || 0);
      $.CGEventPost(0, e);
    }
    delay(0.05);
  };
  const pb = $.NSPasteboard.generalPasteboard;
  const setClip = s => { pb.clearContents; pb.setStringForType($(s), $.NSPasteboardTypeString); };
  const getClip = () => { const s = pb.stringForType($.NSPasteboardTypeString); return s && s.js !== undefined ? s.js : ''; };
  const safe = () => frontIsClaude() && isDev(focusedTitle(axApp));

  ca.activateWithOptions(1); // NSApplicationActivateIgnoringOtherApps
  delay(1);
  if (!frontIsClaude()) { log('stop: Claude did not come to the front'); return 'not front'; }

  let dev = windows(axApp).find(w => isDev(w.title));
  if (!dev) {
    if (isDev(focusedTitle(axApp))) { log('stop: unexpected focus state'); return 'odd'; }
    key(34, CMD | OPT); // Cmd+Opt+I, the app's own "Show Dev Tools" shortcut
    for (let i = 0; i < 40 && !dev; i++) { delay(0.25); dev = windows(axApp).find(w => isDev(w.title)); }
  }
  if (!dev) { log('stop: no window titled Developer Tools appeared (is Developer Mode on?)'); return 'no devtools'; }
  $.AXUIElementPerformAction(dev.el, $('AXRaise'));
  delay(0.6);
  if (!safe()) { log('stop: the focused window is not Developer Tools (focused: ' + focusedTitle(axApp).slice(0, 40) + ')'); return 'unsafe'; }

  const saved = getClip();
  try {
    key(35, CMD | SHIFT); delay(0.9);
    if (!safe()) { log('stop: focus moved before the command menu'); return 'unsafe'; }
    setClip('Show Console'); key(9, CMD); delay(0.9); key(36); delay(1.2);
    if (!safe()) { log('stop: focus moved before pasting'); return 'unsafe'; }
    const code = app.doShellScript('cat ' + q(payload));
    setClip(code); key(9, CMD); delay(0.7);
    if (allowPasting) {
      key(0, CMD); key(51);
      // Chrome only accepts this consent when typed, not pasted.
      for (const c of [0, 37, 37, 31, 13, 49, 35, 0, 1, 17, 34, 45, 5]) key(c); // a l l o w ␣ p a s t i n g
      key(36); delay(0.7);
      key(0, CMD); key(51);
      setClip(code); key(9, CMD); delay(0.7);
    }
    if (!safe()) { log('stop: focus moved before running'); return 'unsafe'; }
    key(36); delay(1.5);
    if (resultPath !== '-') { delay(2); app.doShellScript('pbpaste > ' + q(resultPath)); }
  } finally {
    setClip(saved);
  }
  if (!keepOpen) {
    const btn = attr(dev.el, 'AXCloseButton');
    if (btn) $.AXUIElementPerformAction(ObjC.castRefToObject(btn), $('AXPress'));
  }
  log('applied');
  return 'applied';
})();
