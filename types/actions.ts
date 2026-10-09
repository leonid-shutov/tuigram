import * as _opentui from '@opentui/core';
import { Message, Presence } from './domain';

declare global {
  type SectionName = 'dialogs' | 'chat' | 'messagePrompt' | 'picker' | 'filePicker';

  // ── 7-navigation ──────────────────────────────────────────────────────────────────────
  type Navigation = {
    selected: SectionName;
    /** The section focused before `selected`, where `back` returns to. */
    previous: SectionName;
    cycle: SectionName[];
    cycleSection(step: 1 | -1): void;
    select(section: SectionName): void;
    back(): void;
  };

  // ── 8-actions ─────────────────────────────────────────────────────────────────────────
  type Actions = {
    historyRead(event: HistoryReadEvent): void;
    loadChat(chatId: number): Promise<void>;
    /** Fetch a fast first page of dialogs so the list has something to show before the full fetch lands. */
    loadDialogsPreview(): void;
    /** Fetch the full dialog list and repaint; settles the dialogs UI's loading state either way. */
    loadDialogs(): void;
    /** Fetch archived dialogs into the store and repaint; folders may show them. */
    loadArchivedDialogs(): void;
    /** Fetch the account's folders into the store and repaint. Reruns whenever Telegram changes them. */
    loadFolders(): void;
    loadOlder(): Promise<void>;
    /** Fetch a message's 320px thumbnail, if it has one, and push it into its bubble. */
    loadThumb(message: ChatMessage): void;
    /** Copy the focused message's text to the system clipboard via OSC 52. */
    copySelected(): void;
    /** Push a new text to the server for an already-sent message. */
    sendEdit(messageId: number, text: string): Promise<void>;
    /** Seed the message box with the focused message's text, when it is ours and editable. */
    editSelected(): void;
    notify(message: Message): void;
    /** Suspend the TUI and open config.json in $VISUAL/$EDITOR/vi; resume on exit. */
    openConfig(): Promise<void>;
    /** Download a medium and open it in the system's viewer. */
    openMedia(media: FileMedia): Promise<void>;
    /** Enter on the focused message: its medium, else its text when that is nothing but an http(s) link. */
    openSelected(): void;
    openChat(chatId: number): void;
    /** Open the picker over every chat; a pick opens that chat. */
    searchChats(): void;
    /** Open the picker on what the focused pane can do; picking a command runs it there. */
    showKeys(): void;
    /** Open the picker over the folders; a pick shows that folder. */
    pickFolder(): void;
    /** Show a folder in the dialogs pane and focus it. */
    openFolder(folderId: number): void;
    /** Show the folder `step` away from the current one, wrapping around. */
    stepFolder(step: number): void;
    /** A user's online/last-seen state changed. Ignored unless it's the counterpart of the open chat. */
    presenceUpdate(chatId: number, presence: Presence): void;
    receiveMessage(message: Message): void;
    /** Shut down and have bin/tuigram.js start the app again from scratch: on wake from sleep
     * and on ctrl+r. */
    restart(): void;
    /** Push the open chat — messages, receipt and presence — to the pane. Runs on every `change`
     * of store.chat. */
    repaintChat(): void;
    /** Push the current folder's dialogs to the pane. Runs on every `change` of store.dialogs and
     * store.folders. */
    repaintDialogs(): void;
    /** Redraw the hint bar for whichever section is focused. Follows every `navigation.select`. */
    repaintHints(): void;
    send(text: string): Promise<void>;
    /** Attach a local file: an optimistic pending bubble, then the real upload via mtcute. */
    sendFile(filePath: string): Promise<void>;
    /** The window lost focus; what lands in the open chat from now on stays unread. */
    windowBlur(): void;
    /** The window came back: read whatever landed in the open chat while it was away. */
    windowFocus(): void;
    /** Fetch the latest release, if any, into `store.update.available` and draw its notice. */
    checkUpdate(): Promise<void>;
    /** Suspend the TUI and run the channel's upgrade command; exit cleanly on success. */
    upgrade(): Promise<void>;
    /** Remember the current update as dismissed and hide its notice. */
    dismissUpdate(): void;
  };

  const navigation: Navigation;
  const actions: Actions;
}

export {};
