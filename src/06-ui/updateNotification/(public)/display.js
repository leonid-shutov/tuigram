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
    show(Locale.t('%s needs Node %s (you have %s)', release.version, release.minNode, process.versions.node));
    return;
  }

  const plan = Update.upgradePlan(release);

  if (plan === null) {
    show(Locale.t('%s available', release.version));
    return;
  }

  // Empty steps (aur) means there is nothing `shift+u` could run at all -- only pacman's own
  // helper should touch those files. Show the command unconditionally, not just when unwritable.
  if (plan.steps.length === 0) {
    show(`${Locale.t('%s available', release.version)} — ${plan.manualCommand}`);
    return;
  }

  // A sudo-installed npm prefix can't be upgraded from in here — show the command instead of a
  // key that would just fail with EACCES after the renderer is already torn down.
  if (!Channel.writable(plan)) {
    show(Locale.t('Run: %s', plan.manualCommand));
    return;
  }

  self.text.content = new tui.StyledText([
    tui.fg(config.theme.warning)(Locale.t('tuigram %s is available', release.version)),
    tui.fg(config.theme.muted)(UPDATE_GAP),
    tui.fg(config.theme.accent)('shift+u'),
    tui.fg(config.theme.muted)(Locale.t(' upgrade')),
    tui.fg(config.theme.muted)(UPDATE_GAP),
    tui.fg(config.theme.accent)('shift+x'),
    tui.fg(config.theme.muted)(Locale.t(' dismiss')),
  ]);
  self.component.visible = true;
};
