// Turns the terminal's own colors into tuigram's roles. Called twice: once at config load with
// no detection yet, and again from 2-screen once the renderer has asked the terminal what its
// palette actually is — same function, so the two phases can never drift.
//
// A slot the user cannot see is worse than a wrong-but-visible one, so every borrowed slot is
// measured against the fill it will actually be drawn on and demoted if it disappears into it.
// Each role is checked against its *worst* fill, not just the background: `muted` also sits on
// the input surface, and on the selected row it sits on `selection` — a fill of our own making
// that moves the background toward the foreground, straight through where a terminal's dim
// grey lives. Measured across real themes, slot 8 on `selection` runs 1.1:1 (nord) to 3.3:1
// (github-light), so that one needs a role of its own rather than a shared guard.
const MIN_CONTRAST = 2.2;

/** @type {typeof Theme.derive} */
(mode, terminal) => {
  const bg = tui.RGBA.defaultBackground();
  const fg = tui.RGBA.defaultForeground();
  const dim = tui.RGBA.fromIndex(8);
  const { accent, selfBorder, selected, senderColors } = Theme.slots(mode);

  // Nothing to measure and no real background to blend from. Fall back to shapes that cannot
  // go wrong on any theme: no fill at all behind inputs, reverse video for the selected row.
  if (terminal === null) {
    const base = { bg, fg, muted: dim, border: dim, accent, selfBorder, selected, senderColors };
    return { ...base, surface: bg, selection: fg, selectedText: bg, selectedMuted: bg };
  }

  const { defaultBackground: paper, defaultForeground: ink, palette } = terminal;

  // No palette slot means "one step off the background", so these two have to be mixed. They
  // are mixed to a perceived distance rather than a fixed fraction, because a fraction of a
  // narrow range is a narrow step: solarized-light spans 4.1:1 from background to text, so the
  // same 16% that gives dracula a clear 14.7 ΔL* gave it only 7.2, and the cursor went faint
  // on exactly the light themes where it was already hardest to see.
  const shade = (/** @type {number} */ delta) => {
    const base = Theme.lightness(paper);
    let color = paper;
    for (let t = 0.02; t <= 1 && Math.abs(Theme.lightness(color) - base) < delta; t += 0.02)
      color = Theme.mix(paper, ink, t);
    return color;
  };
  const surface = shade(4);
  const selection = shade(10);

  // Blends `fill` toward the foreground just far enough to clear the floor, rather than by a
  // fixed amount. A fixed ratio is not enough on a low-contrast theme: solarized-dark spans
  // only 4.75:1 from its background to its foreground, so 42% of that way is still invisible.
  // Blending away from the background means the result also clears any fill closer to it.
  const readable = (/** @type {import('@opentui/core').RGBA} */ fill, /** @type {number} */ from) => {
    let color = Theme.mix(fill, ink, from);
    for (let t = from; t < 1 && Theme.contrast(color, fill) < MIN_CONTRAST; t += 0.05)
      color = Theme.mix(fill, ink, Math.min(1, t + 0.05));
    return color;
  };

  // What an indexed color actually renders as: whatever the user mapped that slot to.
  const shown = (/** @type {import('@opentui/core').RGBA} */ color) =>
    // eslint-disable-next-line no-extra-parens -- prettier insists on these parens
    color.intent === 'indexed' ? (palette[color.slot] ?? color) : color;
  const legibleOn = (
    /** @type {import('@opentui/core').RGBA} */ color,
    /** @type {import('@opentui/core').RGBA} */ fill,
    /** @type {import('@opentui/core').RGBA} */ fallback,
  ) => (Theme.contrast(shown(color), fill) >= MIN_CONTRAST ? color : fallback);
  // The same hue from the other half of the palette — a bright color's normal twin, or back.
  const sibling = (/** @type {import('@opentui/core').RGBA} */ color) =>
    tui.RGBA.fromIndex(color.slot < 8 ? color.slot + 8 : color.slot - 8);

  const muted = legibleOn(dim, surface, readable(surface, 0.42));

  return {
    // Still SGR 39/49, but carrying the terminal's real colors as the snapshot the renderer
    // falls back to on early frames and on terminals without truecolor — where opentui's own
    // white-on-black guess would be exactly wrong on a light theme.
    bg: tui.RGBA.defaultBackground(paper),
    fg: tui.RGBA.defaultForeground(ink),
    muted,
    border: muted,
    accent: legibleOn(accent, paper, readable(paper, 0.7)),
    selfBorder: legibleOn(selfBorder, paper, sibling(selfBorder)),
    selected: legibleOn(selected, paper, sibling(selected)),
    senderColors: senderColors.map((color) => legibleOn(color, paper, sibling(color))),
    surface,
    selection,
    selectedText: tui.RGBA.defaultForeground(ink),
    selectedMuted: legibleOn(muted, selection, readable(selection, 0.45)),
  };
};
