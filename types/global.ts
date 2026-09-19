import * as _opentui from '@opentui/core';
import { TelegramClient, Message as MtCuteMessage, Dialog as MtCuteDialog } from '@mtcute/node';
import { Dispatcher } from '@mtcute/dispatcher';
import { Message, Dialog, FileMedia as _FileMedia, ImageMedia, Media, PendingMessage } from './domain';
import { LinkedList as _LinkedList } from './collections';
import { Paths, Source, ThemeDefinition, ResolvedTheme, ImageProtocol as _ImageProtocol, ConfigSchema } from './config';

import * as _timers from 'node:timers';
import * as _events from 'node:events';
import * as _crypto from 'node:crypto';
import * as _fs from 'node:fs';
import * as _os from 'node:os';
import * as _path from 'node:path';
import * as _child_process from 'node:child_process';
import * as _url from 'node:url';
import * as _assert from 'node:assert';
import { Result as _Result } from 'metautil';

declare global {
  type ImageProtocol = _ImageProtocol;
  /** Global because `Media.isFile` narrows to it and `8-actions` passes it around. */
  type FileMedia = _FileMedia;
  type MessagePromptEventMap = {
    send: [text: string];
    edit: [messageId: number, text: string];
    exit: [];
  };

  const tui: typeof _opentui;
  /** `@opentui/keymap`, by entry point — the subpaths `npm` cannot reach. Injected like `tui`. */
  const Keymap: {
    host: typeof import('@opentui/keymap/opentui');
    extras: typeof import('@opentui/keymap/extras');
  };
  /** Every dependency in package.json, keyed by package name. Named ones are typed. */
  const npm: Record<string, any> & {
    '@opentui/qrcode': typeof import('@opentui/qrcode');
    '@mtcute/node': typeof import('@mtcute/node');
    '@mtcute/dispatcher': typeof import('@mtcute/dispatcher');
    '@opentui/keymap': typeof import('@opentui/keymap');
    metautil: typeof import('metautil');
  };
  /** The subset of `config` that reload.js recomputes in place; see [[config.reload]] below. */
  type ConfigSelf = {
    theme: ResolvedTheme;
    /** Whether the dialogs list and the chat pane header prefix each peer with an emoji. */
    dialogEmoji: boolean;
    /** How chat bubbles draw thumbnails; 'off' keeps the text placeholders. */
    imageProtocol: ImageProtocol;
    /** Whether the key hint bar occupies the bottom row. */
    hints: boolean;
  };

  const config: ConfigSelf & {
    /** Credentials are strings everywhere they are read from (env, JSON file, the form). */
    credentials: { apiId: string | undefined; apiHash: string | undefined };
    cli: { command: string | null; args: string[] };
    paths: Paths;
    /** The parsed, migrated, validated `config.json` snapshot theme/dialogEmoji/hints/imageProtocol/
     * proxy are derived from at boot; refreshed by `config.reload()`. */
    source: Source;
    /** Fixing up an old `config.json` shape — nothing else. See docs/decisions/0001-*. */
    migrations: {
      /** Runs every entry in `migrations/migrate.js`'s list; each checks its own old-shape marker
       * and no-ops (same reference) when it isn't there. */
      migrate: (source: Record<string, unknown>) => { source: Source; changed: boolean };
    };
    /** What config.json's keys mean, their defaults, and how config.json gets loaded/validated. */
    schema: {
      defaults: { senderColors: string[]; imageProtocols: ImageProtocol[] };
      fields: ConfigSchema;
      /** Narrows an arbitrary config.json key to one `fields` actually has an entry for. */
      isSchemaKey(key: string): key is keyof ConfigSchema;
      /** Reads config.json, runs it through `config.migrations.migrate`, validates it against
       * `fields`, and (if a migration actually changed something) rewrites `config.json`, all
       * against `config.paths`; used at boot and again by `config.reload()`. */
      resolveConfig: () => Source;
      /** `config.source[key] ?? field.default` for every field, collected into one plain
       * object — the values a fresh config.json would resolve to if it existed right now.
       * Used to seed the editor buffer on first `ctrl+e`. */
      resolveDefaults: () => Source;
    };
    /** The theme catalog and how a theme name becomes a full palette. */
    themes: {
      definitions: Record<string, ThemeDefinition>;
      resolve: (source: Source) => ResolvedTheme;
    };
    /** Proxy URL to connect through, read once at boot; unset connects directly. */
    proxy: string | undefined;
    /**
     * Re-read config.json and recompute theme/hints/dialogEmoji/imageProtocol in place. Layout
     * decisions already baked in at boot (the hints bar's presence, the terminal background) need
     * a restart regardless; this only refreshes what later reads `config.*` live.
     */
    reload(): void;
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
    /** Whether the medium carries something downloadable. Contacts, polls and dice do not. */
    function isFile(media: Media): media is FileMedia;
    /** File extension to give a downloaded medium the sender left unnamed. */
    const extension: (mimeType: string) => string;
  }

  const LinkedDialogs: { from: (dialogs: Dialog[]) => import('./domain').LinkedDialogsHandle };

  namespace LinkedList {
    function from<T>(values?: Iterable<T>): _LinkedList<T>;
  }

  type Result<T = unknown> = _Result<T>;
  const Result: typeof _Result & {
    /** Wrap an already-created promise as a Result, without a thunk — for a single call already
     * in hand. Use `Result.fromAsync` instead when the body is more than one expression. */
    fromPromise<T>(promise: Promise<T>): Promise<_Result<T>>;
  };

  namespace Crash {
    /** Restore the terminal, print to stderr, exit 1. Never returns. */
    function hard(error: unknown, notice?: string): never;
    /**
     * Log the stack and keep going. Failures the user should see about go through
     * `actions.reportError`; this is for the ones they neither caused nor can act on.
     */
    function soft(error: unknown): void;
  }

  namespace AsyncIterator {
    function take<T>(source: AsyncIterable<T> | Iterable<T>, n: number): AsyncGenerator<T>;
  }

  namespace Obj {
    function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
  }

  /** Duck-typed promise check — see `(js)/isThenable.js` for why `instanceof Promise` won't do. */
  function isThenable(value: unknown): value is Promise<unknown>;

  namespace OS {
    const notify: (title: string, body?: string) => void;
    /** Hand a file to the OS's default handler, in its own process. */
    const open: (path: string) => void;
  }

  /** Shared by `OS/notify.js` and `OS/open.js`: fire a child off and stop caring about it. */
  const spawnDetached: (tag: string, cmd: string, args: string[]) => void;

  /**
   * Shared by `Crash/hard.js` and `Crash/soft.js`: an error's stack when it has one, else its
   * string form. Duck-typed because errors cross into this VM from the Node realm, where
   * `Error` is a different constructor — see `(js)/isThenable.js` for the same problem.
   */
  const errorDetail: (error: unknown) => string;

  namespace Fuzzy {
    const score: (query: string, text: string) => number | null;
  }

  namespace Hash {
    const fnv1a: (key: string) => number;
  }

  namespace Link {
    /** The URL when the text is nothing but one http(s) link, else null. */
    const only: (text: string) => string | null;
  }

  namespace Random {
    const id: () => number;
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
    exit(message: string, code: number): never | void;
    fail(error: unknown): void;
    secureSession(): void;
  };

  type AuthSelf = Omit<AuthModule, 'ui'> & { ui: AuthUiSelf };

  // ── 4-messenger ───────────────────────────────────────────────────────────────────────
  type HistoryReadEvent = { chatId: number; isOutbox: boolean; maxReadId: number; unreadCount: number };

  type MessengerModule = {
    tg: TelegramClient;
    dispatcher: Dispatcher;
    getHistory(chatId: number, firstPageSize: number, pageSize?: number): AsyncGenerator<Message[]>;
    /** The 320px thumbnail behind a file id, or null if it could not be fetched. Cached. */
    downloadThumb(fileId: string): Promise<Uint8Array | null>;
    /** The bytes of the full medium behind a file id. Not cached — see the method's note. */
    downloadMedia(fileId: string): Promise<Uint8Array>;
    editMessage(chatId: number, messageId: number, text: string): Promise<Message>;
    getReadOutboxMaxId(chatId: number): Promise<number>;
    iterDialogs(options?: { chunkSize?: number; archived?: boolean }): AsyncGenerator<Dialog>;
    onHistoryRead(handler: (event: HistoryReadEvent) => void): void;
    onNewMessage(handler: (message: Message) => void): void;
    readHistory(chatId: number): Promise<unknown>;
    sendMessage(chatId: number, text: string): Promise<Message>;
  };

  // ── 9-keymap ──────────────────────────────────────────────────────────────────────────
  type KeymapEngine = InstanceType<typeof import('@opentui/keymap').Keymap<_opentui.Renderable, _opentui.KeyEvent>>;
  type KeymapBinding = import('@opentui/keymap').Binding<_opentui.Renderable, _opentui.KeyEvent>;
  /** What a `group()` in `2-bindings.js` is written as: command name to key, key list, or 'none'. */
  type KeymapBindingConfig = import('@opentui/keymap/extras').BindingConfig<_opentui.Renderable, _opentui.KeyEvent>;
  type KeymapActiveBinding = import('@opentui/keymap').ActiveBinding<_opentui.Renderable, _opentui.KeyEvent>;

  /** One named app action. `title` is what the pane labels and, later, a help screen read. */
  type Command = {
    title: string;
    /** A bar-sized label for the hint bar, which falls back to `title` when a command omits it. */
    hint?: string;
    run(): void;
  };

  /** One entry of the hint bar: the keys to press, and what pressing them does. */
  type Hint = { keys: string; label: string };

  namespace Binding {
    /** The binding to put in front of a reader: the unmodified one, else whatever came first. */
    const plainest: (bindings: readonly KeymapActiveBinding[]) => KeymapActiveBinding | undefined;
  }

  /** Commands as they are written: keyed by the name the bindings point at. */
  type Commands = Record<string, Command>;

  type KeymapModule = {
    engine: KeymapEngine;
    commands: Record<'app' | 'dialogs' | 'chat' | 'prompt' | 'picker', Commands>;
    /** Bindings by the layer that installs them; the seam a `keys` block in config.json would feed. */
    bindings: Record<'global' | 'panes' | 'dialogs' | 'chat' | 'prompt' | 'picker', readonly KeymapBinding[]>;
    /** What the hint bar should advertise with `section` focused, in the order to read them. */
    hints(section: SectionName): Hint[];
  };

  // ── the sandbox ───────────────────────────────────────────────────────────────────────
  const screen: ScreenModule;
  const keymap: KeymapModule;
  const auth: AuthModule;
  const messenger: MessengerModule;

  /**
   * Members whose type differs between modules, so the intersection below would be unusable
   * (an intersection of two unrelated types cannot be assigned either one).
   */
  type SelfConflicts =
    | 'component'
    | 'focus'
    | 'blur'
    | 'on'
    | 'list'
    | 'select'
    | 'confirm'
    | 'first'
    | 'last'
    | 'up'
    | 'down'
    | 'moveUp'
    | 'moveDown'
    | 'render'
    | 'replace';

  type AppSelf = Omit<
    ScreenModule &
      ConfigSelf &
      AuthSelf &
      AuthUiSelf &
      MessengerModule &
      DialogsStore &
      ChatStore &
      DialogsSelf &
      ChatSelf &
      MessagePromptSelf &
      PickerSelf &
      HintsSelf &
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
    const url: typeof _url;
    const assert: typeof _assert;
  }
}
