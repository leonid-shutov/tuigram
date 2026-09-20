import type {
  ColorInput,
  KeyEvent,
  OptimizedBuffer,
  Renderable,
  RenderableOptions,
  RenderContext,
  VNode,
} from '@opentui/core';

export type FileEntry = {
  name: string;
  isDirectory: boolean;
};

export type FilePickerKeyBinding = { name: string; ctrl?: boolean; shift?: boolean; meta?: boolean };

export type FilePickerKeyBindings = {
  moveUp?: FilePickerKeyBinding[];
  moveDown?: FilePickerKeyBinding[];
  first?: FilePickerKeyBinding[];
  last?: FilePickerKeyBinding[];
  open?: FilePickerKeyBinding[];
  goUp?: FilePickerKeyBinding[];
  startFilter?: FilePickerKeyBinding[];
  acceptFilter?: FilePickerKeyBinding[];
  cancel?: FilePickerKeyBinding[];
};

export interface FilePickerRenderableOptions extends RenderableOptions<any> {
  startDirectory?: string;
  filter?: (entry: { name: string; isDirectory: boolean }) => boolean;
  backgroundColor?: ColorInput;
  focusedBackgroundColor?: ColorInput;
  textColor?: ColorInput;
  focusedTextColor?: ColorInput;
  selectedBackgroundColor?: ColorInput;
  selectedTextColor?: ColorInput;
  directoryColor?: ColorInput;
  fileColor?: ColorInput;
  descriptionColor?: ColorInput;
  errorColor?: ColorInput;
  keyBindings?: FilePickerKeyBindings;
}

export const FilePickerRenderableEvents: {
  readonly SELECT: 'select';
  readonly CANCEL: 'cancel';
  readonly DIRECTORY_CHANGED: 'directoryChanged';
  readonly SELECTION_CHANGED: 'selectionChanged';
  readonly MODE_CHANGED: 'modeChanged';
  readonly ERROR: 'error';
};

export class FilePickerRenderable extends Renderable {
  constructor(ctx: RenderContext, options?: FilePickerRenderableOptions);

  readonly cwd: string;
  readonly selectedEntry: FileEntry | null;
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

  on(event: 'select', handler: (filePath: string) => void): this;
  on(event: 'cancel', handler: () => void): this;
  on(event: 'directoryChanged', handler: (cwd: string) => void): this;
  on(event: 'selectionChanged', handler: (index: number, entry: FileEntry | null) => void): this;
  on(event: 'modeChanged', handler: (filtering: boolean) => void): this;
  on(event: 'error', handler: (error: unknown) => void): this;

  handleKeyPress(key: KeyEvent): boolean;
  renderSelf(buffer: OptimizedBuffer, deltaTime: number): void;
}

export function FilePicker(
  props?: FilePickerRenderableOptions,
  ...children: (VNode | Renderable)[]
): VNode<FilePickerRenderableOptions>;
