import { Message, Dialog, LinkedDialogsHandle } from './domain';

declare global {
  type DialogsEventMap = {
    /** The list's content changed in a way the UI must repaint. */
    changed: [];
    /** A message arrived from the dispatcher and survived the archive filter. */
    message: [message: Message];
  };

  /**
   * The dialog list, as data. Nothing here knows a renderable exists — that invariant is what
   * lets the dialogs pane and the picker read the same list without reading each other.
   */
  type DialogsStore = {
    all(): Dialog[];
    /** Fold a message into the list, whichever direction it came from. */
    applyMessage(message: Message): void;
    find(chatId: number): Dialog | null;
    isArchived(chatId: number): boolean;
    isMuted(chatId: number): boolean;
    /** Fill the list from the messenger: fast first page, then the full list, then the archive. */
    load(): Promise<void>;
    markRead(chatId: number): void;
    on<K extends keyof DialogsEventMap>(event: K, handler: (...args: DialogsEventMap[K]) => void): void;
    /** A message from the dispatcher: archive filter, then `applyMessage`, then `message`. */
    receive(message: Message): void;
    set(dialogs: Dialog[]): void;
    setArchived(dialogs: Dialog[]): void;
    setUnread(chatId: number, unreadCount: number): void;
  };

  /**
   * State is `self`-private by convention. `self` is `Object.create(container)`, so
   * `self.dialogs = …` shadows rather than updates the module property — which is exactly why
   * nothing outside the store may read `store.dialogs.dialogs`; go through `all()`/`find()`.
   */
  type DialogsStoreSelf = DialogsStore & {
    dialogs: LinkedDialogsHandle;
    /** Chat ids in the archive folder. Empty until the archived page finishes loading. */
    archived: Set<number>;
    /**
     * Deliberately untyped: `EventEmitter<Map>`'s conditional arg type does not survive a
     * generic `K`, so the map is enforced on the `emit`/`on` facade instead of the emitter.
     */
    dialogEvents: import('node:events').EventEmitter;
    emit<K extends keyof DialogsEventMap>(event: K, ...args: DialogsEventMap[K]): void;
  };

  namespace store {
    const dialogs: DialogsStore;
  }
}

export {};
