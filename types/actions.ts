import * as _opentui from '@opentui/core';
import { Message } from './domain';

declare global {
  type SectionName = 'dialogs' | 'chat' | 'messagePrompt' | 'picker';

  // ── 7-navigation ──────────────────────────────────────────────────────────────────────
  type Navigation = {
    selected: SectionName;
    cycle: SectionName[];
    cycleSection(step: 1 | -1): void;
    select(section: SectionName): void;
  };

  // ── 8-actions ─────────────────────────────────────────────────────────────────────────
  type Actions = {
    historyRead(event: HistoryReadEvent): void;
    loadChat(chatId: number): Promise<void>;
    loadOlder(): Promise<void>;
    /** Fetch a message's 320px thumbnail, if it has one, and push it into its bubble. */
    loadThumb(message: ChatMessage): void;
    /** Copy the focused message's text to the system clipboard via OSC 52. */
    copySelected(): void;
    notify(message: Message): void;
    /** Download a medium and open it in the system's viewer. */
    openMedia(media: FileMedia): Promise<void>;
    /** Enter on the focused message: its medium, else its text when that is nothing but an http(s) link. */
    openSelected(): void;
    openChat(chatId: number): void;
    receiveMessage(message: Message): void;
    /** Push the dialog list to both of its views. Follows every store.dialogs mutation. */
    repaintDialogs(): void;
    /** Redraw the hint bar for whichever section is focused. Follows every `navigation.select`. */
    repaintHints(): void;
    /** Redraw the open chat's read receipt. Follows every change to its tail or watermark. */
    repaintReceipt(): void;
    send(text: string): Promise<void>;
    /** The window lost focus; what lands in the open chat from now on stays unread. */
    windowBlur(): void;
    /** The window came back: read whatever landed in the open chat while it was away. */
    windowFocus(): void;
  };

  const navigation: Navigation;
  const actions: Actions;
}

export {};
