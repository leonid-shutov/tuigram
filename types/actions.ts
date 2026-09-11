import * as _opentui from '@opentui/core';
import { Message } from './domain';

declare global {
  type SectionName = 'dialogs' | 'chat' | 'messagePrompt' | 'picker';

  // ── 7-navigation ──────────────────────────────────────────────────────────────────────
  type Navigation = {
    selected: SectionName;
    cycle: SectionName[];
    shortcuts: Record<string, { label: string; section: SectionName }>;
    sectionShortcuts: Partial<Record<SectionName, Record<string, SectionName>>>;
    cycleSection(step: 1 | -1): void;
    select(section: SectionName): void;
    /** The app's single key handler: Tab cycles, shortcuts jump, everything else goes to the focused section. */
    handleKey(event: _opentui.KeyEvent): void;
  };

  // ── 8-actions ─────────────────────────────────────────────────────────────────────────
  type Actions = {
    historyRead(event: HistoryReadEvent): void;
    loadChat(chatId: number): Promise<void>;
    loadOlder(): Promise<void>;
    /** Fetch a message's 320px thumbnail, if it has one, and push it into its bubble. */
    loadThumb(message: ChatMessage): void;
    notify(message: Message): void;
    openChat(chatId: number): void;
    receiveMessage(message: Message): void;
    /** Push the dialog list to both of its views. Follows every store.dialogs mutation. */
    repaintDialogs(): void;
    /** Redraw the open chat's read receipt. Follows every change to its tail or watermark. */
    repaintReceipt(): void;
    send(text: string): Promise<void>;
  };

  const navigation: Navigation;
  const actions: Actions;
}

export {};
