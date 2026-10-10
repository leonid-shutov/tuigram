import * as _opentui from '@opentui/core';
import type { QRCodeOptions, QRCodeRenderable } from '@opentui/qrcode';
import type { ResolvedTheme } from './config';

type ChildNode = _opentui.BaseRenderable | null | undefined | false | '';
type Children = ChildNode | Children[];

type _SearchListItem = { name: string; description: string; value: unknown };

type _SearchListOptions = _opentui.BoxOptions & {
  theme: ResolvedTheme;
  placeholder?: string;
};

/** A query line over the items that match it, ranked by `Fuzzy.rank`. */
interface _SearchListRenderable extends _opentui.BoxRenderable {
  input: _opentui.TextareaRenderable;
  list: _opentui.SelectRenderable;
  items: SearchListItem[];
  /** The query the list was last ranked for; `null` until the next `filter`. */
  query: string | null;
  placeholder: string;
  /** The highlighted item's value, `null` when nothing matches. */
  readonly selected: unknown;
  /** Swap what is searched, re-filtering against the current query. */
  setItems(items: SearchListItem[]): void;
  /** Clear the query and show every item. */
  reset(): void;
  filter(): void;
  moveUp(): void;
  moveDown(): void;
}

/** One edge's groups. Within a group the last part gives way first; the right group, whole, before
 * the left one. The centre group shows whole, and only while it clears both side titles. */
type _PanelEdge = { left?: string[]; right?: string[]; center?: string[] };

/** An edge's groups joined for one frame. */
type _ComposedEdge = {
  title: string | undefined;
  alignment: 'left' | 'right';
  right?: string;
  center?: string;
};

type _PanelOptions = _opentui.BoxOptions & {
  /** The parts each edge's title is built from: a group per side, in drawing order. */
  titleParts?: { top?: _PanelEdge; bottom?: _PanelEdge };
};

/** A box whose edge titles are built from named parts. */
interface _PanelRenderable extends _opentui.BoxRenderable {
  /** Set a declared title part's text. */
  setTitlePart(name: string, text: string): void;
  /** Show `text` over a declared part for `ms`; the part's own text comes back after. */
  flashTitlePart(name: string, text: string, ms: number): void;
  /** Empty a declared title part; the title closes up around it. */
  clearTitlePart(name: string): void;
}

type _FileEntry = { name: string; isDirectory: boolean };

type _FilePickerKeyBinding = { name: string; ctrl?: boolean; shift?: boolean; meta?: boolean };

type _FilePickerKeyBindings = Partial<
  Record<
    'moveUp' | 'moveDown' | 'first' | 'last' | 'open' | 'goUp' | 'startFilter' | 'acceptFilter' | 'cancel',
    _FilePickerKeyBinding[]
  >
>;

type _FilePickerOptions = _opentui.RenderableOptions<any> & {
  /** Defaults to `process.cwd()`. */
  startDirectory?: string;
  /** Applied to files only — directories always stay navigable so a filtered file type stays reachable. */
  filter?: (entry: _FileEntry) => boolean;
  backgroundColor?: _opentui.ColorInput;
  focusedBackgroundColor?: _opentui.ColorInput;
  textColor?: _opentui.ColorInput;
  focusedTextColor?: _opentui.ColorInput;
  selectedBackgroundColor?: _opentui.ColorInput;
  selectedTextColor?: _opentui.ColorInput;
  directoryColor?: _opentui.ColorInput;
  fileColor?: _opentui.ColorInput;
  descriptionColor?: _opentui.ColorInput;
  errorColor?: _opentui.ColorInput;
  keyBindings?: _FilePickerKeyBindings;
};

/** Browses the local filesystem and lets the user pick one file, netrw-style. */
interface _FilePickerRenderable extends _opentui.Renderable {
  readonly cwd: string;
  readonly selectedEntry: _FileEntry | null;
  /** Whether the live filter is being edited right now, as opposed to merely applied. */
  readonly filtering: boolean;
  readonly filter: string;
  refresh(): void;
  moveUp(steps?: number): void;
  moveDown(steps?: number): void;
  first(): void;
  last(): void;
  open(): void;
  goUp(): void;
  backspace(): void;
  startFilter(): void;
  acceptFilter(): void;
  clearFilter(): void;
  cancel(): void;
}

type ComponentFactory<TOptions extends object, TInstance extends _opentui.BaseRenderable> = (
  props?: { children?: Children } & Partial<Omit<TOptions, 'children'>>,
) => TInstance;

declare global {
  type OpenTUIChildren = Children;
  type SearchListItem = _SearchListItem;
  type SearchListOptions = _SearchListOptions;
  type SearchListRenderable = _SearchListRenderable;
  type PanelEdge = _PanelEdge;
  type ComposedEdge = _ComposedEdge;
  type PanelOptions = _PanelOptions;
  type PanelRenderable = _PanelRenderable;
  type FileEntry = _FileEntry;
  type FilePickerKeyBinding = _FilePickerKeyBinding;
  type FilePickerKeyBindings = _FilePickerKeyBindings;
  type FilePickerOptions = _FilePickerOptions;
  type FilePickerRenderable = _FilePickerRenderable;

  function Component<TOptions extends object, TInstance extends _opentui.BaseRenderable>(
    RenderableClass: new (ctx: _opentui.RenderContext, options: TOptions) => TInstance,
  ): ComponentFactory<TOptions, TInstance>;

  const Box: ComponentFactory<_opentui.BoxOptions, _opentui.BoxRenderable>;
  const Image: ComponentFactory<_opentui.ImageRenderableOptions, _opentui.ImageRenderable>;
  const Input: ComponentFactory<_opentui.InputRenderableOptions, _opentui.InputRenderable>;
  const Select: ComponentFactory<_opentui.SelectRenderableOptions, _opentui.SelectRenderable> & {
    /**
     * Repaint each visible row's trailing `marker` substring in its own colour, bypassing
     * SelectRenderable's one-colour-per-row text draw. Reaches into undocumented opentui
     * internals; throws immediately if the installed opentui no longer has what it needs,
     * rather than drawing silently wrong. Call once, right after creating the Select — it stays
     * live across every later `options` write and scroll.
     */
    paintMarker<TOption extends _opentui.SelectOption & { marker: string }>(
      component: _opentui.SelectRenderable,
      colorFor: (option: TOption) => _opentui.RGBA,
    ): void;
  };
  const Text: ComponentFactory<_opentui.TextOptions, _opentui.TextRenderable>;
  const Textarea: ComponentFactory<_opentui.TextareaOptions, _opentui.TextareaRenderable>;
  const ScrollBox: ComponentFactory<_opentui.ScrollBoxOptions, _opentui.ScrollBoxRenderable> & {
    preserveScroll(component: _opentui.ScrollBoxRenderable, mutate: () => void): void;
    scrollToBottom(component: _opentui.ScrollBoxRenderable): void;
    /** Scroll `child` fully into view, top-pinned when it is as tall as the viewport. */
    reveal(component: _opentui.ScrollBoxRenderable, child: _opentui.Renderable): void;
  };
  const QRCode: ComponentFactory<QRCodeOptions, QRCodeRenderable>;
  const SearchList: ComponentFactory<_SearchListOptions, _SearchListRenderable>;
  const Panel: ComponentFactory<_PanelOptions, _PanelRenderable>;
  const FilePicker: ComponentFactory<_FilePickerOptions, _FilePickerRenderable> & {
    Events: {
      /** A file was chosen. Payload: its absolute path. The renderable does not hide itself. */
      readonly SELECT: 'select';
      /** The user asked to leave without picking anything. */
      readonly CANCEL: 'cancel';
      /** The browsed directory changed. Payload: the new absolute path. */
      readonly DIRECTORY_CHANGED: 'directoryChanged';
      /** The highlighted row changed. Payload: (index, entry). */
      readonly SELECTION_CHANGED: 'selectionChanged';
      /** Entered or left filter-editing mode. Payload: whether filtering is now active. */
      readonly MODE_CHANGED: 'modeChanged';
      /** A `readdir`/`stat` failed. Payload: the raw error. */
      readonly ERROR: 'error';
    };
  };
}

export {};
