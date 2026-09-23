import * as _opentui from '@opentui/core';
import type { QRCodeOptions, QRCodeRenderable } from '@opentui/qrcode';
import type { FilePickerRenderableOptions, FilePickerRenderable } from '@leonid-shutov/opentui-file-picker';

type ChildNode = _opentui.BaseRenderable | null | undefined | false | '';
type Children = ChildNode | Children[];

type ComponentFactory<TOptions extends object, TInstance extends _opentui.BaseRenderable> = (
  props?: { children?: Children } & Partial<Omit<TOptions, 'children'>>,
) => TInstance;

declare global {
  type OpenTUIChildren = Children;

  function Component<TOptions extends object, TInstance extends _opentui.BaseRenderable>(
    RenderableClass: new (ctx: _opentui.RenderContext, options: TOptions) => TInstance,
  ): ComponentFactory<TOptions, TInstance>;

  const Box: ComponentFactory<_opentui.BoxOptions, _opentui.BoxRenderable>;
  const Image: ComponentFactory<_opentui.ImageRenderableOptions, _opentui.ImageRenderable>;
  const Input: ComponentFactory<_opentui.InputRenderableOptions, _opentui.InputRenderable>;
  const Select: ComponentFactory<_opentui.SelectRenderableOptions, _opentui.SelectRenderable>;
  const Text: ComponentFactory<_opentui.TextOptions, _opentui.TextRenderable>;
  const Textarea: ComponentFactory<_opentui.TextareaOptions, _opentui.TextareaRenderable>;
  const ScrollBox: ComponentFactory<_opentui.ScrollBoxOptions, _opentui.ScrollBoxRenderable> & {
    preserveScroll(component: _opentui.ScrollBoxRenderable, mutate: () => void): void;
    scrollToBottom(component: _opentui.ScrollBoxRenderable): void;
    /** Scroll `child` fully into view, top-pinned when it is as tall as the viewport. */
    reveal(component: _opentui.ScrollBoxRenderable, child: _opentui.Renderable): void;
  };
  const QRCode: ComponentFactory<QRCodeOptions, QRCodeRenderable>;
  const FilePicker: ComponentFactory<FilePickerRenderableOptions, FilePickerRenderable>;
}

export {};
