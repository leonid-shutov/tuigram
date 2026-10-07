import * as _opentui from '@opentui/core';
import type { QRCodeOptions, QRCodeRenderable } from '@opentui/qrcode';
import type { ResolvedTheme } from './config';
import type { FilePickerRenderableOptions, FilePickerRenderable } from '@leonid-shutov/opentui-file-picker';

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
 * the left one. */
type _PanelEdge = { left?: string[]; right?: string[] };

type _PanelOptions = _opentui.BoxOptions & {
  /** The parts each edge's title is built from: a group per side, in drawing order. */
  titleParts?: { top?: _PanelEdge; bottom?: _PanelEdge };
};

/** A box whose edge titles are built from named parts. */
interface _PanelRenderable extends _opentui.BoxRenderable {
  /** Set a declared title part's text. */
  setTitlePart(name: string, text: string): void;
  /** A declared title part's current text. */
  getTitlePart(name: string): string;
  /** Empty a declared title part; the title closes up around it. */
  clearTitlePart(name: string): void;
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
  type PanelOptions = _PanelOptions;
  type PanelRenderable = _PanelRenderable;

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
  const FilePicker: ComponentFactory<FilePickerRenderableOptions, FilePickerRenderable>;
}

export {};
