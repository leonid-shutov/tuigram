import * as _opentui from '@opentui/core';
import { TelegramClient, Message as MtCuteMessage, Dialog as MtCuteDialog } from '@mtcute/node';
import { Dispatcher } from '@mtcute/dispatcher';
import { Message, Dialog, ImageMedia, Media, PendingMessage } from './domain';
import { LinkedList as _LinkedList } from './collections';
import { Paths, Source, Borders, ResolvedTheme, ImageProtocol as _ImageProtocol } from './config';

import * as _timers from 'node:timers';
import * as _events from 'node:events';
import * as _crypto from 'node:crypto';
import * as _fs from 'node:fs';
import * as _os from 'node:os';
import * as _path from 'node:path';
import * as _child_process from 'node:child_process';

declare global {
  type ImageProtocol = _ImageProtocol;
  type MessagePromptEventMap = {
    send: [text: string];
    exit: [];
  };

  const tui: typeof _opentui;
  /** Every dependency in package.json, keyed by package name. Named ones are typed. */
  const npm: Record<string, any> & {
    '@opentui/qrcode': typeof import('@opentui/qrcode');
    '@mtcute/node': typeof import('@mtcute/node');
    '@mtcute/dispatcher': typeof import('@mtcute/dispatcher');
  };
  const config: {
    /** Colors, all of them borrowed from the terminal. Refined in place by 2-screen once the
     * renderer can ask the terminal what its palette is. */
    theme: ResolvedTheme;
    /** Frame style and glyphs for every panel and bubble. */
    borders: Borders;
    /** Width of the dialogs panel, in cells. */
    panelWidth: number;
    /** Credentials are strings everywhere they are read from (env, JSON file, the form). */
    credentials: { apiId: string | undefined; apiHash: string | undefined };
    cli: { command: string | null; args: string[] };
    paths: Paths;
    /** Whether the dialogs list and the chat pane header prefix each peer with an emoji. */
    dialogEmoji: boolean;
    /** How chat bubbles draw thumbnails; 'off' keeps the text placeholders. */
    imageProtocol: ImageProtocol;
  };

  namespace Preview {
    /** One-line summary of a message: its text, else a label for its media. */
    const of: (message: Message | PendingMessage | null | undefined) => string;
    const ofMedia: (media: Media) => string;
  }

  namespace Message {
    const from: (message: MtCuteMessage) => Message;
    const pending: (text: string) => PendingMessage;
  }

  namespace Dialog {
    function from(dialog: MtCuteDialog): Dialog;
    function fromMessage(message: Message, unreadCount?: number): Dialog;
  }

  namespace Emoji {
    /** Peer glyphs. Single-codepoint, 2 cells wide — see the file header before editing. */
    const pool: string[];
    function fromHash(chatId: number): string;
  }

  namespace Media {
    const from: (message: MtCuteMessage) => Media | null;
    /** Narrows to the variants carrying an image; the union's only tag test for it. */
    function isImage(media: Media | null): media is ImageMedia;
    /** Bubble size in cells, or null when the medium has no drawable image. */
    const size: (media: ImageMedia) => { cols: number; rows: number } | null;
  }

  const LinkedDialogs: { from: (dialogs: Dialog[]) => import('./domain').LinkedDialogsHandle };

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
    function take<T>(source: AsyncIterable<T> | Iterable<T>, n: number): AsyncGenerator<T>;
  }

  namespace Obj {
    function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
  }

  namespace KeyInput {
    const onKey: (handler: (event: _opentui.KeyEvent) => void) => void;
    const chord: (event: _opentui.KeyEvent) => string;
  }

  const Keys: { CTRL_P: string; SLASH: string };

  namespace OS {
    const notify: (title: string, body?: string) => void;
  }

  namespace Fuzzy {
    const score: (query: string, text: string) => number | null;
  }

  namespace Hash {
    const fnv1a: (key: string) => number;
  }

  namespace Random {
    const id: () => number;
  }

  const paths: Paths;
  const source: Source;

  namespace Theme {
    /** Every role, derived from the terminal's own colors. `terminal` is null when the terminal
     * answered no OSC query, which selects the fallbacks that cannot go wrong on any theme. */
    const derive: (mode: _opentui.ThemeMode, terminal: _opentui.NormalizedTerminalPalette | null) => ResolvedTheme;
    /** Which ANSI slot each stand-out role borrows, per side of the palette. */
    const slots: (
      mode: _opentui.ThemeMode,
    ) => Pick<ResolvedTheme, 'accent' | 'selfBorder' | 'selected' | 'senderColors'>;
    /** Linear blend, `t` of the way from `a` to `b`. The result is a literal RGB color. */
    const mix: (a: _opentui.RGBA, b: _opentui.RGBA, t: number) => _opentui.RGBA;
    /** WCAG contrast ratio, 1 (identical) to 21 (black on white). */
    const contrast: (a: _opentui.RGBA, b: _opentui.RGBA) => number;
  }

  const Frame: (props: { title: string; children: OpenTUIChildren }) => _opentui.BoxRenderable;

  // ── 3-auth ────────────────────────────────────────────────────────────────────────────
  type AuthScreenHandle = {
    onKey(handler: (event: _opentui.KeyEvent) => void): void;
    render(): void;
    dispose(): void;
  };

  type AuthUiModule = {
    current: AuthScreenHandle | null;
    dispose(): void;
    credentialsForm(): Promise<{ apiId: string; apiHash: string }>;
    passwordPrompt(invalid: boolean): Promise<string>;
    phoneCode(options: { invalid: boolean; sentVia: string | null }): Promise<string>;
    phoneNumber(): Promise<string>;
    qrLogin(onPhone: () => void): (url: string) => void;
  };

  type AuthUiSelf = AuthUiModule & {
    mount(props: { title: string; children: OpenTUIChildren }): AuthScreenHandle;
    ask(props: { label: string; hint: string; placeholder: string }): Promise<string>;
    askPassword(props: { label: string; hint: string }): Promise<string>;
  };

  type AuthModule = {
    client: TelegramClient;
    ui: AuthUiModule;
  };

  type AuthSelf = Omit<AuthModule, 'ui'> & {
    ui: AuthUiSelf;
    exit(message: string, code: number): never | void;
    fail(error: unknown): void;
    secureSession(): void;
  };

  // ── 4-messenger ───────────────────────────────────────────────────────────────────────
  type HistoryReadEvent = { chatId: number; isOutbox: boolean; maxReadId: number; unreadCount: number };

  type MessengerModule = {
    tg: TelegramClient;
    dispatcher: Dispatcher;
    getHistory(chatId: number, firstPageSize: number, pageSize?: number): AsyncGenerator<Message[]>;
    /** The 320px thumbnail behind a file id, or null if it could not be fetched. Cached. */
    downloadThumb(fileId: string): Promise<Uint8Array | null>;
    getReadOutboxMaxId(chatId: number): Promise<number>;
    iterDialogs(options?: { chunkSize?: number; archived?: boolean }): AsyncGenerator<Dialog>;
    onHistoryRead(handler: (event: HistoryReadEvent) => void): void;
    onNewMessage(handler: (message: Message) => void): void;
    readHistory(chatId: number): Promise<unknown>;
    sendMessage(chatId: number, text: string): Promise<Message>;
  };

  // ── the sandbox ───────────────────────────────────────────────────────────────────────
  const screen: ScreenModule;
  const auth: AuthModule;
  const messenger: MessengerModule;

  /**
   * Members whose type differs between modules, so the intersection below would be unusable
   * (an intersection of two unrelated types cannot be assigned either one).
   */
  type SelfConflicts = 'component' | 'focus' | 'key' | 'capturing' | 'on' | 'list' | 'select' | 'confirm';

  type AppSelf = Omit<
    ScreenModule &
      AuthSelf &
      AuthUiSelf &
      MessengerModule &
      DialogsStore &
      ChatStore &
      DialogsSelf &
      ChatSelf &
      MessagePromptSelf &
      PickerSelf &
      Navigation &
      Actions,
    SelfConflicts
  > &
    Record<SelfConflicts, any>;

  const self: AppSelf;

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
