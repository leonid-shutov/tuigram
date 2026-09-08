import type { RGBA } from '@opentui/core';

/** Rendering protocol for chat thumbnails. 'off' is ours, not OpenTUI's: draw no images at all. */
export type ImageProtocol = 'auto' | 'kitty' | 'sixel' | 'blocks' | 'off';

export type BorderChars = {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
  topT: string;
  bottomT: string;
  leftT: string;
  rightT: string;
  cross: string;
};

export type Borders = {
  style: 'rounded' | 'heavy' | 'single' | 'double';
  chars?: BorderChars;
  /** Swapped onto the bubble under the cursor — a thicker set than `chars`/`style`. */
  cursorChars: BorderChars;
};

/**
 * Semantic color roles, every one of them borrowed from the terminal: an ANSI palette slot, the
 * terminal's own default fg/bg, or a blend of those two. Never a color of tuigram's own.
 */
export type ResolvedTheme = {
  /** The terminal's background. Opaque, so it can fill a floating panel. */
  bg: RGBA;
  fg: RGBA;
  /** Hints, message previews, unfocused panel titles. */
  muted: RGBA;
  /** Unfocused panel and bubble frames. */
  border: RGBA;
  /** The focused panel's frame and title, and every cursor. */
  accent: RGBA;
  /** Frame of a bubble you sent. */
  selfBorder: RGBA;
  /** Frame of the bubble under the cursor. */
  selected: RGBA;
  /** Fill behind a text input — one step off the background. */
  surface: RGBA;
  /** Fill behind the selected row of a list. */
  selection: RGBA;
  /** Text on `selection`. Its own role because the no-detection fallback is reverse video. */
  selectedText: RGBA;
  /** Secondary text on `selection`. `muted` is a dim grey and `selection` moves the background
   * straight through it, so this cannot just reuse `muted`. */
  selectedMuted: RGBA;
  /** Group sender names, indexed by a hash of the sender. */
  senderColors: RGBA[];
};

export type Paths = {
  config: string;
  data: string;
  state: string;
  settings: string;
  credentials: string;
  session: string;
  log: string;
};

/** Parsed settings file. Unknown keys are tolerated; these are the ones 1-config reads. */
export type Source = {
  /** Peer glyphs in the dialogs list and the chat pane header. Defaults to true; set to false
   * on terminals whose font has no emoji coverage. */
  dialogEmoji?: boolean;
  /** How chat bubbles draw thumbnails. Defaults to 'auto'. */
  imageProtocol?: ImageProtocol;
  /** Frame style for every panel and bubble. Defaults to 'rounded'. */
  borderStyle?: Borders['style'];
  /** Draw frames with +/-/| instead of box-drawing glyphs. Defaults to false. */
  asciiBorders?: boolean;
  /** Width of the dialogs panel in cells. Defaults to 30. */
  panelWidth?: number;
} & Record<string, unknown>;
