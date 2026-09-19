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
  borderChars?: BorderChars;
  selfBorder?: string;
  selected?: string;
  senderColors?: string[];
};

export type ResolvedTheme = ThemePalette & {
  borderStyle: ThemeDefinition['borderStyle'];
  borderChars?: BorderChars;
  selfBorder: string;
  selected: string;
  senderColors: string[];
};

export type Paths = {
  config: string;
  data: string;
  state: string;
  settings: string;
  settingsBackup: string;
  settingsSeed: string;
  credentials: string;
  session: string;
  log: string;
};

/** Parsed settings file. Unknown keys are tolerated; these are the ones 1-config reads. */
export type Source = {
  theme?: string;
  /** Peer glyphs in the dialogs list and the chat pane header. Defaults to true; set to false
   * on terminals whose font has no emoji coverage. */
  dialogEmoji?: boolean;
  /** How chat bubbles draw thumbnails. Defaults to 'auto'. */
  imageProtocol?: ImageProtocol;
  /** The key hint bar along the bottom edge. Defaults to true; set to false to reclaim the row. */
  hints?: boolean;
  /** Proxy URL to connect through, e.g. `socks5://user:pass@host:port`,
   * `http://host:port`, or a `t.me/proxy?...` MTProxy link. Unset connects directly. */
  proxy?: string;
} & Record<string, unknown>;

/** One entry of the `(common)/schema.js` table: a `Source` field's default, whether
 * `config.reload()` may recompute it live, and how to tell a valid value from a bad one. */
export type ConfigSchemaField<T> = {
  default: T;
  hotReload: boolean;
  validate: (value: unknown) => boolean;
};

export type ConfigSchema = {
  theme: ConfigSchemaField<string>;
  dialogEmoji: ConfigSchemaField<boolean>;
  hints: ConfigSchemaField<boolean>;
  imageProtocol: ConfigSchemaField<ImageProtocol>;
  proxy: ConfigSchemaField<string | undefined>;
};
