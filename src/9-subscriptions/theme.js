// Follow the terminal when the user flips their system theme mid-session.
//
// Every color prop set at construction is rewritten here, not just the blended ones: the
// contrast guard can demote any borrowed slot to a blend, so `muted` and `accent` are as
// likely to change value as `surface` is. Whatever a component was built with in 6-ui has to
// be reassigned here, or the two drift apart.
//
// Subscribing to `palette` is also what makes a truecolor terminal re-query at all: without a
// listener it never bothers. That same subscription is why this guards re-entry — the refresh
// below queries the palette, and the answer arrives back through this handler.
let refreshing = false;

const repaintList = (/** @type {import('@opentui/core').SelectRenderable} */ list) => {
  list.backgroundColor = config.theme.bg;
  list.focusedBackgroundColor = config.theme.bg;
  list.textColor = config.theme.fg;
  list.focusedTextColor = config.theme.fg;
  list.descriptionColor = config.theme.muted;
  list.selectedBackgroundColor = config.theme.selection;
  list.selectedTextColor = config.theme.selectedText;
  list.selectedDescriptionColor = config.theme.selectedMuted;
};

const repaintInput = (/** @type {import('@opentui/core').TextareaRenderable} */ input) => {
  input.placeholderColor = config.theme.muted;
  input.focusedBackgroundColor = config.theme.surface;
  input.textColor = config.theme.fg;
  input.focusedTextColor = config.theme.fg;
  input.cursorColor = config.theme.accent;
};

const repaintFrame = (/** @type {import('@opentui/core').BoxRenderable} */ box, /** @type {boolean} */ focused) => {
  box.borderColor = focused ? config.theme.accent : config.theme.border;
  box.titleColor = focused ? config.theme.accent : config.theme.muted;
};

const repaint = async () => {
  if (refreshing) return;
  refreshing = true;
  try {
    screen.renderer.clearPaletteCache();
    await screen.refreshTheme();
  } catch (error) {
    // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
    console.log('theme refresh failed:', /** @type {Error} */ (error).message);
    return;
  } finally {
    refreshing = false;
  }

  repaintList(ui.dialogs.list);
  repaintList(ui.picker.list);
  repaintInput(ui.picker.input);
  repaintInput(ui.messagePrompt.input);
  ui.picker.input.backgroundColor = config.theme.surface;
  ui.messagePrompt.input.backgroundColor = config.theme.bg;

  // The picker floats, so it keeps an accent frame whether or not it holds focus.
  ui.picker.component.backgroundColor = config.theme.bg;
  ui.picker.component.borderColor = config.theme.accent;
  ui.picker.component.titleColor = config.theme.accent;
  ui.chat.header.fg = config.theme.accent;
  for (const section of navigation.cycle) repaintFrame(ui[section].component, navigation.selected === section);

  screen.renderer.requestRender();
};

screen.renderer.on(tui.CliRenderEvents.THEME_MODE, repaint);
screen.renderer.on(tui.CliRenderEvents.PALETTE, repaint);
