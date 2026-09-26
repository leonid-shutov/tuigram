// Not named GAP: tsc treats every non-module .js file's top-level bindings as one shared global
// scope, and src/06-ui/hints/(public)/render.js already declares its own GAP.
const UPDATE_GAP = '  ';

/** @type {UpdateSection['display']} */
(release) => {
  /** @param {string} text */
  const show = (text) => {
    self.text.content = new tui.StyledText([tui.fg(config.theme.muted)(text)]);
    self.component.visible = true;
  };

  if (Update.blockedByNode(release)) {
    show(`${release.version} needs Node ${release.minNode} (you have ${process.versions.node})`);
    return;
  }

  const plan = Update.upgradePlan(release);

  if (plan === null) {
    show(`${release.version} available`);
    return;
  }

  // A sudo-installed npm prefix can't be upgraded from in here — show the command instead of a
  // key that would just fail with EACCES after the renderer is already torn down.
  if (!Channel.writable(plan)) {
    show(`Run: ${plan.manualCommand}`);
    return;
  }

  self.text.content = new tui.StyledText([
    tui.fg(config.theme.warning)('New version is available! Upgrade to get new features!'),
    tui.fg(config.theme.muted)(UPDATE_GAP),
    tui.fg(config.theme.accent)('alt+u'),
    tui.fg(config.theme.muted)(' upgrade'),
    tui.fg(config.theme.muted)(UPDATE_GAP),
    tui.fg(config.theme.accent)('alt+shift+u'),
    tui.fg(config.theme.muted)(' dismiss'),
  ]);
  self.component.visible = true;
};
