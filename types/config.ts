/** Rendering protocol for chat thumbnails. 'off' is ours, not OpenTUI's: draw no images at all. */
export type ImageProtocol = 'auto' | 'kitty' | 'sixel' | 'blocks' | 'off';

export type ThemePalette = {
  bg: string;
  surface: string;
  selection: string;
  fg: string;
  muted: string;
  border: string;
  accent: string;
  accentAlt: string;
};

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

export type ThemeDefinition = {
  palette: ThemePalette;
  borderStyle: 'rounded' | 'heavy' | 'single' | 'double';
  panelWidth: number;
  borderChars?: BorderChars;
  selfBorder?: string;
  selected?: string;
  senderColors?: string[];
};

export type ResolvedTheme = ThemePalette & {
  borderStyle: ThemeDefinition['borderStyle'];
  borderChars?: BorderChars;
  panelWidth: number;
  selfBorder: string;
  selected: string;
  senderColors: string[];
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
  theme?: string;
  /** Set to false on terminals whose font has no emoji coverage. Defaults to true. */
  dialogEmoji?: boolean;
  /** How chat bubbles draw thumbnails. Defaults to 'auto'. */
  imageProtocol?: ImageProtocol;
} & Record<string, unknown>;
