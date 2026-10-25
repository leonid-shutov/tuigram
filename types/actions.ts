import * as _opentui from '@opentui/core';
import { Message, Presence } from './domain';

declare global {
  type SectionName = 'dialogs' | 'chat' | 'messagePrompt' | 'picker' | 'choice' | 'filePicker';

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
    /** Fetch the dialog list a page at a time, the main list and then the archive, landing each page
     * in the store as it comes; settles the dialogs UI's loading state once the main list is in. */
    loadDialogs(): Promise<void>;
    /** Fetch the account's folders into the store and repaint. Reruns whenever Telegram changes them. */
    loadFolders(): void;
    /** Fill a cached chat, open or not, with its first page: its newest messages, the ones it
     * opens with, reaching back to its unread divider when Telegram gives that many at once. */
    loadFirstPage(chatId: number): Promise<void>;
    /** Cache the chats at the top of the chat list, as many as the cache holds, and fill them one
     * at a time, so opening one is instant. Stops at a flood wait. */
    preloadChats(): Promise<void>;
    /** Fetch the open chat's next page of older history, under a spinner; reports a failure. */
    loadOlder(): Promise<void>;
    /** Fetch a message's 320px thumbnail, if it has one, and push it into its bubble. */
    loadThumb(message: Message): void;
    /** Resolve the sender and text of what each message replies to, and push them into its bubble.
     * The messages are one chat's; those not cached are skipped. */
    loadReplies(messages: Message[]): void;
    /** Put the prompt in reply mode for the focused message and focus it. */
    replySelected(): void;
    /** Pick a chat and forward the focused message there, an album whole. */
    forwardSelected(): void;
    /** Pick how to delete the focused message (for everyone or just for us) and delete it. */
    deleteSelected(): void;
    /** Take messages out of the open chat and refresh the dialog preview they may have been. */
    dropMessages(chatId: number, ids: number[]): void;
    /** Messages were deleted elsewhere. */
    messagesDeleted(event: DeleteEvent): void;
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
    /** Enter on the focused message: its medium; else its text when that is nothing but an http(s)
     * link; else a link in it, confirmed first, or picked from a list when there are several. */
    openSelected(): void;
    /** Ask before opening `link`: where it goes, then open it or copy it. */
    confirmLink(link: { label: string; url: string }): void;
    /** Show a chat and focus it; one not open yet opens on its first unread message, under the
     * unread divider, or else its newest, with what that takes fetched unless cached. */
    openChat(chatId: number): Promise<void>;
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
    /** Widen or narrow the dialogs pane by `delta` cells and redraw its rows to fit. */
    resizeDialogs(delta: number): void;
    /** A user's online/last-seen state changed; kept for every user, open chat or not. */
    presenceUpdate(userId: number, presence: Presence): void;
    /** Someone started or stopped typing in a chat; kept for every chat, open or not. */
    userTyping(event: TypingEvent): void;
    receiveMessage(message: Message): void;
    /** A message was edited elsewhere: redraw it in the open chat and refresh the dialog preview. */
    messageEdited(message: Message, partIds: number[]): void;
    /** A cached message's reactions changed: store the new set, keeping which are ours where it
     * doesn't say. */
    reactionsChanged(event: ReactionsEvent): void;
    /** Shut down and have bin/tuigram.js start the app again from scratch: on wake from sleep
     * and on ctrl+r. */
    restart(): void;
    /** Push the open chat's messages to the pane as bubbles, with the run of ours its partner hasn't
     * read yet and the divider above the ones we hadn't when it came into view. Runs on every
     * `change` of store.chat (the messages, the divider) and store.dialogs (the read mark). */
    repaintChat(): void;
    /** Put the open chat's name on the pane's top border. Runs on every `change` of store.chat and
     * store.dialogs, and after a config reload. */
    repaintChatTitle(): void;
    /** Draw who is typing in the open chat, or else its partner's presence. Runs on every `change` of
     * store.chat (which chat is open, and who its typists are by name) and store.peers. */
    repaintPresence(): void;
    /** Push the current folder's dialogs to the pane. Runs on every `change` of store.dialogs and
     * store.folders. */
    repaintDialogs(): void;
    /** Redraw the hint bar for whichever section is focused. Follows every `navigation.select`. */
    repaintHints(): void;
    /** Send a text, as a reply to `replyTo` when given: an optimistic pending bubble, then the real send. */
    send(text: string, replyTo?: number | null): Promise<void>;
    /** Attach a local file: an optimistic pending bubble, then the real upload via mtcute. */
    sendFile(filePath: string, replyTo?: number | null): Promise<void>;
    /** Mark the open chat read, here and on Telegram, when the window is focused and it has anything
     * unread. Runs whenever the open chat may have just been seen: it opened, a message landed in
     * it, or the window came back. */
    readOpenChat(): void;
    /** The window lost focus; what lands in the open chat from now on stays unread. */
    windowBlur(): void;
    /** The window came back: mark what landed in the open chat while it was away with the unread
     * divider, then read it. */
    windowFocus(): void;
    /** Fetch the latest release, if any, into `store.update.available` and draw its notice. */
    checkUpdate(): Promise<void>;
    /** Delete the cached thumbnails and media no hit has touched for `config.cache.maxAgeMs`. */
    pruneCache(): Promise<void>;
    /** Suspend the TUI and run the channel's upgrade command; exit cleanly on success. */
    upgrade(): Promise<void>;
    /** Remember the current update as dismissed and hide its notice. */
    dismissUpdate(): void;
  };

  const navigation: Navigation;
  const actions: Actions;
}

export {};
