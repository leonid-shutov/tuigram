import * as _opentui from '@opentui/core';
import {
  TelegramClient,
  Message as MtCuteMessage,
  Dialog as MtCuteDialog,
  User as MtCuteUser,
  UserStatusUpdate,
  tl,
} from '@mtcute/node';
import { Dispatcher } from '@mtcute/dispatcher';
import {
  Message,
  Dialog as _Dialog,
  Folder as _Folder,
  FileMedia as _FileMedia,
  ImageMedia,
  Media,
  PendingMessage,
  Presence,
} from './domain';
import { KeyedList as _KeyedList, LinkedList as _LinkedList } from './collections';
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
import * as _https from 'node:https';
import * as _buffer from 'node:buffer';
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
    '@leonid-shutov/opentui-file-picker': typeof import('@leonid-shutov/opentui-file-picker');
    '@mtcute/node': typeof import('@mtcute/node');
    '@mtcute/dispatcher': typeof import('@mtcute/dispatcher');
    '@opentui/keymap': typeof import('@opentui/keymap');
    metautil: typeof import('metautil');
    'string-width': typeof import('string-width');
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
    /** Credentials are strings everywhere they are read from (env, JSON file, the form, the shipped
     * key). `source` says which one won; `undefined` means none did and the form is next. */
    credentials: {
      apiId: string | undefined;
      apiHash: string | undefined;
      source: 'env' | 'file' | 'shipped' | undefined;
    };
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
    /** Whether to check registry.npmjs.org / the tap formula for a newer release, once a day at
     * most, read once at boot from config.json + $TUIGRAM_UPDATE. Not in ConfigSelf: reload()
     * skips every field whose `hotReload` is false, and this one's check already ran. */
    updateCheck: boolean;
    /**
     * Re-read config.json and recompute theme/hints/dialogEmoji/imageProtocol in place. Layout
     * decisions already baked in at boot (the hints bar's presence, the terminal background) need
     * a restart regardless; this only refreshes what later reads `config.*` live.
     */
    reload(): void;
  };

  namespace Message {
    const pending: (text: string, media?: Media[]) => PendingMessage;
    /** One-line summary of a message: its text, else a label for its media; null for none. */
    const preview: (message: Message | PendingMessage | null | undefined) => string | null;
  }

  namespace Dialog {
    function fromMessage(message: Message, unreadCount?: number): Dialog;
    /** An unread count as shown in the dialogs list, capped at '999+'; null for none. */
    function unreadBadge(count: number): string | null;
    /** The first dialog per chat id, in their order. */
    function unique(dialogs: Iterable<Dialog>): Dialog[];
  }

  type Dialog = _Dialog;
  type Folder = _Folder;

  namespace Folder {
    /** "All chats": every chat outside the archive, in the main list's own order. */
    const ALL: _Folder;
    /** Whether a folder's rules and peer lists take in this dialog; Telegram's own filter, ported. */
    const includes: (folder: _Folder, dialog: Dialog) => boolean;
    /** The folder's chats: its pinned ones in their order, then the rest, latest activity first. */
    const view: (folder: _Folder, dialogs: Iterable<Dialog>) => Dialog[];
  }

  namespace Emoji {
    /** Peer glyphs. Single-codepoint, 2 cells wide — see the file header before editing. */
    const pool: string[];
    function fromHash(chatId: number): string;
  }

  namespace Media {
    /** Narrows to the variants carrying an image; the union's only tag test for it. */
    function isImage(media: Media | null): media is ImageMedia;
    /** Whether the medium carries something downloadable. Contacts, polls and dice do not. */
    function isFile(media: Media): media is FileMedia;
    /** File extension to give a downloaded medium the sender left unnamed. */
    const extension: (mimeType: string) => string;
    /** One-line label for a medium with no caption of its own — 📷 Photo, 🎬 GIF, etc. */
    const label: (media: Media) => string;
  }

  const LinkedDialogs: { from: (dialogs: Dialog[]) => import('./domain').LinkedDialogsHandle };

  namespace LinkedList {
    function from<T>(values?: Iterable<T>): _LinkedList<T>;
  }

  namespace KeyedList {
    /** Throws on a repeated key: the index could only name one of them. */
    function from<T, K>(items: Iterable<T>, keyOf: (item: T) => K): _KeyedList<T, K>;
  }

  type Result<T = unknown> = _Result<T>;
  const Result: typeof _Result & {
    /** Wrap an already-created promise as a Result, without a thunk — for a single call already
     * in hand. Use `Result.fromAsync` instead when the body is more than one expression. */
    fromPromise<T>(promise: Promise<T>): Promise<_Result<T>>;
  };

  /** Process termination: `hard` for a crash, `soft` for one the app survives, `exit` for a
   * clean shutdown. */
  namespace Crash {
    /** Restore the terminal, print to stderr, exit 1. Never returns. */
    function hard(error: unknown, notice?: string): never;
    /**
     * Log the stack and keep going. Failures the user should see about go through
     * `ui.errors.report`; this is for the ones they neither caused nor can act on.
     */
    function soft(error: unknown): void;
    /**
     * The graceful counterpart to `hard`: dispose the auth UI, restore the terminal, close the
     * Telegram client, then write `tuigram: <message>` to stderr (unless it's null) and exit with
     * `code`. Returns before the process goes down — the exit waits on the client closing — so a
     * caller that has more statements after it must `return`.
     */
    function exit(message: string | null, code: number): void;
  }

  namespace Explain {
    /** The one-line technical summary for an expanded toast — `error.text`/`.message`, trimmed
     * to its first line. Not the full stack; see `Explain.stack` for that. */
    function line(error: unknown): string;
    /**
     * An error's stack when it has one, else its string form. Duck-typed because errors cross
     * into this VM from the Node realm, where `Error` is a different constructor — see
     * `(js)/isThenable.js` for the same problem.
     */
    function stack(error: unknown): string;
  }

  namespace AsyncIterator {
    function take<T>(source: AsyncIterable<T> | Iterable<T>, n: number): AsyncGenerator<T>;
  }

  namespace Arr {
    /** Each item under its own `key`, for lookups by that field; a later duplicate wins. */
    function keyBy<T, K extends keyof T>(key: K, items: readonly T[]): Map<T[K], T>;
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
    /** Run `cmd` in the foreground (inherited stdio) and resolve its exit code; rejects only if
     * the process itself couldn't be spawned. */
    const run: (cmd: string, args: string[]) => Promise<number | null>;
    /** Call `handler` whenever the process wakes after being frozen: machine suspend, SIGSTOP. */
    const onWake: (handler: () => void) => void;
  }

  namespace Cache {
    /** Writes `bytes` to `path` atomically (via a sibling `.part` file, renamed into place) and
     * resolves to `path`. Rejects, cleaning up the `.part` file, if the write fails. */
    const write: (path: string, bytes: Uint8Array) => Promise<string>;
  }

  /** Shared by `OS/notify.js` and `OS/open.js`: fire a child off and stop caring about it. */
  const spawnDetached: (tag: string, cmd: string, args: string[]) => void;

  /**
   * Injected by `bin/tuigram.js`: prints the boxed crash report (stderr box + log line) that a
   * boot-time crash already uses, so `Crash.hard` matches it exactly. Also logs to the log file.
   */
  const crashReport: (label: string, detail: string) => void;

  /**
   * Injected by `bin/tuigram.js` (`bin/channel.js`), same pattern as `crashReport` above: how an
   * install is shaped, and how to upgrade it, is decided once, since `bin/tuigram.js`'s own
   * `upgrade` subcommand needs the exact same detection and plan before the sandbox exists to
   * run them through src/(common)/Update/ instead.
   */
  namespace Channel {
    const detect: (rootDir: string) => UpdateChannel;
    const brewBinary: (rootDir: string) => string;
    const npmPrefix: (rootDir: string) => string | null;
    /** The per-channel upgrade plan for `rootDir`'s install, targeting `version` (a concrete
     * version, or `'latest'`), or `null` when there is nothing to run. */
    const upgradePlan: (rootDir: string, version: string) => UpgradePlan | null;
    /** Whether `upgradePlan`'s prefix (if any) can actually be written to — `true` when there is
     * no prefix to check, e.g. brew, or no plan at all. */
    const writable: (plan: UpgradePlan | null) => boolean;
  }

  /** Injected by `bin/tuigram.js`: this install's own `package.json` version, read once before
   * the sandbox exists (the same read `--version` already uses) rather than re-reading it from
   * `__rootDir` in here. */
  const packageVersion: string;

  /** Injected by `bin/tuigram.js`: the exit code that makes it start the app again. */
  const __restartExitCode: number;

  /** A generic never-rejecting HTTPS GET, with no knowledge of what it's fetching — used by
   * src/(common)/Update/'s own `(common)/Source/` to reach npm's registry and the homebrew
   * tap, but not tied to either. */
  namespace Fetch {
    /** One HTTPS GET; resolves `null` on any failure, timeout, or over-size response rather
     * than rejecting. */
    const once: (
      url: string,
      headers: Record<string, string>,
    ) => Promise<{ status: number; location: string | null; body: string } | null>;
    /** `once`, following up to 2 `https:` redirects; `null` on any non-2xx or failure. */
    const text: (url: string, headers: Record<string, string>) => Promise<string | null>;
  }

  namespace Fuzzy {
    const score: (query: string, text: string) => number | null;
    /** The items whose `name` matches, best first; a wrong-layout query ranks a notch lower. */
    const rank: <T extends { name: string }>(query: string, items: T[]) => T[];
  }

  namespace Layout {
    /** The text as if typed on the other keyboard layout (QWERTY ⇄ ЙЦУКЕН), char by char;
     * characters on neither layout pass through. Lowercased. */
    const swap: (text: string) => string;
  }

  namespace Hash {
    const fnv1a: (key: string) => number;
  }

  /** Calendar days in local time. */
  namespace Day {
    /** Equal for two dates on the same local day. */
    const key: (date: Date) => string;
    /** `Today`, `Yesterday`, else `Mon, 6 Oct` — with the year only when it isn't `now`'s. */
    const label: (date: Date, now?: Date) => string;
  }

  namespace Base64 {
    /** Joins base64 pieces and decodes them (trimmed); '' for anything that is not a list. */
    const decodeFragments: (fragments: unknown) => string;
  }

  /** Text measured in terminal cells rather than UTF-16 units: CJK and most emoji take two. */
  namespace Cells {
    const width: (text: string) => number;
    /** `clip`, plus the width in cells the clipped prefix takes. */
    const cut: (text: string, width: number) => { text: string; cells: number };
    /** The longest prefix of `text` that fits in `width` cells. */
    const clip: (text: string, width: number) => string;
    /** `text` clipped, then padded with spaces to exactly `width` cells. */
    const fit: (text: string, width: number) => string;
  }

  namespace Link {
    /** The URL when the text is nothing but one http(s) link, else null. */
    const only: (text: string) => string | null;
  }

  namespace Random {
    const id: () => number;
  }

  namespace Engines {
    /** The minimum version out of a leading `>=` range, else `null` (unknown, not "none"). */
    const minimum: (range: string | undefined) => string | null;
  }

  /** Hand-rolled semver: metautil has no version helper, and this repo only ever compares
   * versions it itself publishes. */
  namespace Version {
    type Parsed = { core: [number, number, number]; pre: (string | number)[] };
    /** MAJOR.MINOR.PATCH[-pre][+build], numeric core required; anything else is `null`. */
    const parse: (version: string) => Parsed | null;
    /** -1 | 0 | 1; unparseable on either side compares as a tie (`0`), never a spurious update. */
    const compare: (left: string, right: string) => -1 | 0 | 1;
    /** `compare(candidate, current) > 0`, and never a prerelease onto a stable `current`. */
    const newer: (candidate: string, current: string) => boolean;
  }

  const Frame: (props: { title: string; children: OpenTUIChildren }) => _opentui.BoxRenderable;

  // ── 3-auth ────────────────────────────────────────────────────────────────────────────
  type AuthScreenHandle = {
    onKey(handler: (event: _opentui.KeyEvent) => void): void;
    onPaste(handler: (event: _opentui.PasteEvent) => void): void;
    render(): void;
    dispose(): void;
  };

  type AuthUiModule = {
    current: AuthScreenHandle | null;
    dispose(): void;
    /** `invalid`: the key the user gave did not work, and the form says so above the instructions. */
    credentialsForm(options: { invalid: boolean }): Promise<{ apiId: string; apiHash: string }>;
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
    fail(error: unknown): void;
    secureSession(): void;
    /** A client on `config.credentials` as they stand at call time. */
    createClient(): TelegramClient;
    /** Writes credentials.json (0600) and makes it the active key. */
    saveCredentials(credentials: { apiId: string; apiHash: string }): void;
    /** Whether Telegram did not accept the app key itself. */
    keyRejected(error: unknown): boolean;
  };

  type AuthSelf = Omit<AuthModule, 'ui'> & { ui: AuthUiSelf };

  // ── 4-messenger ───────────────────────────────────────────────────────────────────────
  type HistoryReadEvent = { chatId: number; isOutbox: boolean; maxReadId: number; unreadCount: number };

  type MessengerModule = {
    tg: TelegramClient;
    dispatcher: Dispatcher;
    getHistory(chatId: number, firstPageSize: number, pageSize?: number): AsyncGenerator<Message[]>;
    /** Path to the larger thumbnail (800px box, falling back to 320px) behind a file id, on
     * disk, or null if it could not be fetched. Cached in memory and on disk. */
    downloadThumb(fileId: string): Promise<string | null>;
    /** The bytes of the full medium behind a file id. Not cached — see the method's note. */
    downloadMedia(fileId: string): Promise<Uint8Array>;
    /** Edit a message's text. For an album the answer carries only the edited part's medium. */
    editMessage(chatId: number, messageId: number, text: string): Promise<Message>;
    /** The chat partner's current online/last-seen state, or `null` for a bot or a peer that's gone. */
    getPresence(chatId: number): Promise<Presence | null>;
    getReadOutboxMaxId(chatId: number): Promise<number>;
    iterDialogs(options?: { chunkSize?: number; archived?: boolean }): AsyncGenerator<Dialog>;
    /** The account's folders in the user's order, "All chats" among them. */
    getFolders(): Promise<Folder[]>;
    /** Telegram changed a folder, added or removed one, or reordered them. */
    onFoldersChange(handler: () => void): void;
    onHistoryRead(handler: (event: HistoryReadEvent) => void): void;
    onNewMessage(handler: (message: Message) => void): void;
    onPresenceUpdate(handler: (chatId: number, presence: Presence) => void): void;
    readHistory(chatId: number): Promise<unknown>;
    sendMessage(chatId: number, text: string): Promise<Message>;
    sendFile(chatId: number, filePath: string, params?: { caption?: string }): Promise<Message>;
  };

  /** The mtcute→domain conversions, private to this section — everywhere else only ever sees the
   * already-converted `Message`/`Dialog`/`Presence`/`Media` that `MessengerModule`'s methods return. */
  type MessengerSelf = MessengerModule & {
    toMessage(message: MtCuteMessage): Message;
    /** One message from every Telegram message of an album: the captioned part's id and text,
     * every part's medium. */
    toAlbum(parts: MtCuteMessage[]): Message;
    toMedia(message: MtCuteMessage): Media | null;
    toDialog(dialog: MtCuteDialog): Dialog;
    toFolder(filter: tl.TypeDialogFilter): Folder;
    /** `null` for the `'bot'` status — nothing to show for a bot. */
    toPresence(entity: MtCuteUser | UserStatusUpdate): Presence | null;
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
    /** A bar-sized label for the hint bar, which falls back to `title` when a command omits it;
     * `false` keeps the command off the bar, though the keys palette still lists it. */
    hint?: string | false;
    /** Which hints the bar keeps when it runs out of width; `'normal'` when omitted. */
    priority?: HintPriority;
    /** Folds the named partner into this command's hint, e.g. `j/k Move`. Set on the leading command
     * only; the partner keeps its own hint for when this one has no active binding. */
    pair?: { with: string; hint: string };
    run(): void;
  };

  /** `essential` is what a first-time user could not guess; `obvious` is what anybody would. */
  type HintPriority = 'essential' | 'normal' | 'obvious';

  /** One entry of the hint bar: the keys to press, what pressing them does, and how much it matters. */
  type Hint = { keys: string; label: string; priority: HintPriority };

  /** A command the focused section can reach, with every binding that reaches it, best first. */
  type AvailableCommand = { name: string; command: Command; bindings: KeymapActiveBinding[] };

  namespace Binding {
    /** The binding to put in front of a reader: the unmodified one, else whatever came first. */
    const plainest: (bindings: readonly KeymapActiveBinding[]) => KeymapActiveBinding | undefined;
    /** A binding as the bar and the keys palette print it: `gg`, `esc`, `alt+/`. */
    const format: (binding: KeymapActiveBinding) => string;
  }

  /** Commands as they are written: keyed by the name the bindings point at. */
  type Commands = Record<string, Command>;

  type KeymapModule = {
    engine: KeymapEngine;
    commands: Record<'app' | 'dialogs' | 'folders' | 'chat' | 'prompt' | 'picker' | 'filePicker', Commands>;
    /** Bindings by the layer that installs them; the seam a `keys` block in config.json would feed. */
    bindings: Record<
      | 'global'
      | 'panes'
      | 'dialogs'
      | 'folders'
      | 'chat'
      | 'prompt'
      | 'picker'
      | 'filePickerBrowse'
      | 'filePickerFilter',
      readonly KeymapBinding[]
    >;
    /** What `section` can reach — its own groups and the app's — in declared order. */
    available(section: SectionName): AvailableCommand[];
    /** What the hint bar should advertise with `section` focused, in the order to read them. */
    hints(section: SectionName): Hint[];
  };

  // ── (common)/Update ───────────────────────────────────────────────────────────────────
  /** 'git' and 'unknown' both mean "never check" — a checkout, or a shape check() doesn't know. */
  type UpdateChannel = 'brew' | 'npm' | 'mise' | 'aur' | 'git' | 'unknown';
  type UpdateRelease = { version: string; minNode: string | null };
  /** What `actions.upgrade()` runs, in order (empty for a channel — currently only aur — that has
   * nothing this process can run itself, e.g. because only the user's AUR helper should touch
   * pacman's files); the prefix to check for write access first (`null` for brew and aur, which
   * own their own permissions); and the channel-appropriate command to show the user, either
   * because that prefix isn't writable, or unconditionally when `steps` is empty (`null` only
   * when, as for brew, it never needs to be shown either way). */
  type UpgradePlan = {
    steps: { cmd: string; args: string[] }[];
    prefix: string | null;
    manualCommand: string | null;
  };

  namespace Update {
    /** Fetch the latest release for `Channel.detect(__rootDir)`, or `null` when there is nothing
     * newer to offer. Runs once per launch, with no caching between runs. Never rejects. */
    const check: () => Promise<UpdateRelease | null>;
    /** The per-channel upgrade plan for `release`, or `null` when there is nothing to run. */
    const upgradePlan: (release: UpdateRelease) => UpgradePlan | null;
    /** `false` when `release.minNode` is satisfied (or there is none); `true` when the running
     * Node is too old, in which case the notice row shows a message instead of the upgrade key,
     * and `upgrade()` refuses to proceed past. */
    const blockedByNode: (release: UpdateRelease) => boolean;
  }

  /** Visible only within src/(common)/Update/ at runtime (its own `(common)/` subdir), same as
   * `Binding` above is scoped to src/09-keymap/ — see the loader's Common-dir rule. */
  namespace Source {
    const npm: () => Promise<UpdateRelease | null>;
    const brew: () => Promise<UpdateRelease | null>;
    const mise: () => Promise<UpdateRelease | null>;
    const aur: () => Promise<UpdateRelease | null>;
  }

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
    | 'replace'
    | 'setAll';

  type AppSelf = Omit<
    ScreenModule &
      ConfigSelf &
      AuthSelf &
      AuthUiSelf &
      MessengerSelf &
      DialogsStoreSelf &
      FoldersStoreSelf &
      ChatStore &
      DialogsSelf &
      ChatSelf &
      MessagePromptSelf &
      PickerSelf &
      FilePickerSelf &
      HintsSelf &
      ErrorsSelf &
      UpdateSelf &
      Navigation &
      Actions,
    SelfConflicts
  > &
    Record<SelfConflicts, any>;

  const self: AppSelf;

  /** Injected by uncommonjs's `loadTree`: the resolved package root, i.e. `path.resolve(__dirname,
   * '..')` from `bin/tuigram.js`. Used by src/(common)/Update to read package.json and detect
   * the install channel, since src/ otherwise has no `__dirname`. */
  const __rootDir: string;

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
    const https: typeof _https;
    const buffer: typeof _buffer;
  }
}
