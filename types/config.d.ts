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

export type Source = Record<string, unknown>;
