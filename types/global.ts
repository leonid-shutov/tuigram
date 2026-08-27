import * as _opentui from '@opentui/core';
import { Message as MtCuteMessage, Dialog as MtCuteDialog } from '@mtcute/node';
import { Message, Dialog, UiDialog, Media, DialogOption, LinkedDialogsHandle, PendingMessage } from './domain';
import { LinkedList as _LinkedList } from './collections';
import { Paths, Source, ThemeDefinition, ResolvedTheme } from './config';

import * as _timers from 'node:timers';
import * as _events from 'node:events';
import * as _crypto from 'node:crypto';
import * as _fs from 'node:fs';
import * as _os from 'node:os';
import * as _path from 'node:path';
import * as _child_process from 'node:child_process';

declare global {
  type MessagePromptEventMap = {
    send: [text: string];
    mode: [mode: string];
    translit: [enabled: boolean];
    exit: [];
  };

  const tui: typeof _opentui;
  /** Every dependency in package.json, keyed by package name. Named ones are typed. */
  const npm: Record<string, any> & {
    '@opentui/qrcode': typeof import('@opentui/qrcode');
    '@mtcute/node': typeof import('@mtcute/node');
    '@mtcute/dispatcher': typeof import('@mtcute/dispatcher');
    neovim: typeof import('neovim');
  };
  const config: {
    theme: ResolvedTheme;
    /** Credentials are strings everywhere they are read from (env, JSON file, the form). */
    credentials: { apiId: string | undefined; apiHash: string | undefined };
    cli: { command: string | null; args: string[] };
    paths: Paths;
    translit: boolean;
    vim: boolean;
  };

  namespace Message {
    const from: (message: MtCuteMessage) => Message;
    const pending: (text: string) => PendingMessage;
  }

  namespace Dialog {
    function from(dialog: MtCuteDialog): Dialog;
  }

  namespace UiDialog {
    function from(dialog: Dialog): UiDialog;
    function preview(message: Pick<Message, 'text'> & { media?: Message['media'] }): string;
    function fromMessage(message: Message, unreadCount?: number): UiDialog;
    function toOption(dialog: UiDialog): DialogOption;
  }

  namespace Media {
    const from: (message: MtCuteMessage) => Media | null;
    const placeholder: (media: Media | null | undefined) => string | null;
  }

  const LinkedDialogs: { from: (dialogs: UiDialog[]) => LinkedDialogsHandle };

  namespace LinkedList {
    function from<T>(values?: Iterable<T>): _LinkedList<T>;
  }

  namespace Err {
    function risk<F extends (...args: any[]) => any>(
      fn: F,
      ...args: Parameters<F>
    ): [error: null, result: ReturnType<F>] | [error: Error, result: null];
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
    const id: () => number;
  }

  const paths: Paths;
  const source: Source;
  const themes: Record<string, ThemeDefinition>;

  const Frame: (props: { title: string; children: OpenTUIChildren }) => _opentui.BoxRenderable;

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
