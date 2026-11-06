// ClaudePurple launcher. It never changes: it runs runner.js from
// ~/Library/Application Support/ClaudePurple, so fixes don't need a rebuild
// (and don't cost the Accessibility permission again).
ObjC.import('AppKit');
ObjC.import('CoreGraphics');
ObjC.import('ApplicationServices');

function run() {
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;
  const base = app.doShellScript('echo "$HOME"') + '/Library/Application Support/ClaudePurple/';
  const src = app.doShellScript("cat '" + base.replace(/'/g, "'\\''") + "runner.js'");
  return eval(src);
}
