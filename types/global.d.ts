import * as _blessed from 'blessed';
import * as _opentui from '@opentui/core';
import { NeovimClient } from 'neovim';
import { Message as MtCuteMessage, Dialog as MtCuteDialog, TelegramClient } from '@mtcute/node';
import { Dispatcher } from '@mtcute/dispatcher';
import { AppMessage, Dialog, UiDialog, MediaDescriptor, DialogOption, LinkedDialogsHandle } from './domain';
import { LinkedList as _LinkedList } from './collections';
import { Paths, Source, ThemeDefinition, ResolvedTheme } from './config';

import * as _timers from 'node:timers';
import * as _events from 'node:events';
import * as _crypto from 'node:crypto';
import * as _fs from 'node:fs';
import * as _os from 'node:os';
import * as _path from 'node:path';
import * as _child_process from 'node:child_process';

type MessagePromptEventMap = {
  send: [text: string];
  mode: [mode: string];
  translit: [enabled: boolean];
  exit: [];
};

declare global {
  const tui: typeof _opentui;
  const nvim: NeovimClient;
  const npm: Record<string, any> & { '@opentui/qrcode': typeof import('@opentui/qrcode') };
  const config: { theme: ResolvedTheme; paths: Paths; translit: boolean; vim: boolean };

  namespace screen {
    const renderer: _opentui.CliRenderer;
    const wrapper: _opentui.BoxRenderable;
  }

  namespace auth {
    const tg: TelegramClient;
    const credentials: { apiId: number; apiHash: string };
  }

  namespace messenger {
    const tg: TelegramClient;
    const dispatcher: Dispatcher;
    const sendMessage: (chatId: string, text: string) => Promise<MtCuteMessage>;
    const getReadOutboxMaxId: (chatId: string) => Promise<number>;
  }

  namespace Message {
    const from: (message: MtCuteMessage) => AppMessage;
    const pending: (text: string) => AppMessage;
  }

  namespace Dialog {
    function from(dialog: MtCuteDialog): Dialog;
  }

  // 5-ui/2-sections/1-dialogs/(common)/UiDialog/* — named apart from the `Dialog` namespace
  // above so the two (common) scopes don't merge into overloads (they're unrelated at runtime;
  // ambient declarations can't be scoped per-directory the way the loader is).
  namespace UiDialog {
    function from(dialog: Dialog): UiDialog;
    function preview(message: Pick<AppMessage, 'text' | 'media'>): string;
    function fromMessage(message: AppMessage, unreadCount?: number): UiDialog;
    function toOption(dialog: UiDialog): DialogOption;
  }

  namespace Media {
    const from: (message: MtCuteMessage) => MediaDescriptor | null;
    const placeholder: (media: MediaDescriptor | null) => string | null;
  }

  const LinkedDialogs: { from: (dialogs: UiDialog[]) => LinkedDialogsHandle };

  namespace LinkedList {
    function from<T>(values?: Iterable<T>): _LinkedList<T>;
  }

  namespace Err {
    function risk<F extends (...args: any[]) => any>(
      fn: F,
      ...args: Parameters<F>
    ): [null, ReturnType<F>] | [unknown, null];
  }

  namespace AsyncIterator {
    function map<T, U>(source: AsyncIterable<T> | Iterable<T>, fn: (item: T) => U | Promise<U>): AsyncGenerator<U>;
    function take<T>(source: AsyncIterable<T> | Iterable<T>, n: number): AsyncGenerator<T>;
  }

  namespace Obj {
    function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
  }

  namespace KeyInput {
    const onKey: (handler: (event: _opentui.KeyEvent) => void) => void;
    const on: (...args: Parameters<_opentui.KeyHandler['on']>) => void;
  }

  const Keys: { CTRL_L: string; CTRL_P: string };

  namespace OS {
    const notify: (title: string, body?: string) => void;
  }

  namespace Fuzzy {
    const score: (query: string, text: string) => number | null;
  }

  namespace Random {
    const uuid: () => string;
  }

  const paths: Paths;
  const source: Source;
  const themes: Record<string, ThemeDefinition>;

  const Frame: (props: { title: string; children: OpenTUIChildren }) => _opentui.BoxRenderable;

  // 5-ui/2-sections/3-messagePrompt/(common)/ — scoped to that subtree at runtime, declared
  // globally here per this project's existing ambient-typing convention (same simplification as
  // `auth`/`messenger` above).
  const events: import('node:events').EventEmitter<MessagePromptEventMap>;
  const input: _opentui.TextareaRenderable;

  namespace node {
    const timers: typeof _timers;
    const events: typeof _events;
    const crypto: typeof _crypto;
    const fs: typeof _fs;
    const os: typeof _os;
    const path: typeof _path;
    const child_process: typeof _child_process;
  }
}
