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
  };

  // ── 8-actions ─────────────────────────────────────────────────────────────────────────
  type Actions = {
    /** The open chat's history pager; undefined until a chat is opened. */
    pager: AsyncGenerator<Message[]> | undefined;
    historyRead(event: HistoryReadEvent): void;
    loadChat(chatId: number): Promise<void>;
    loadOlder(): Promise<void>;
    notify(message: Message): void;
    openChat(chatId: number): void;
    receiveMessage(message: Message): void;
    /** Push the dialog list to both of its views. Follows every store.dialogs mutation. */
    repaintDialogs(): void;
    send(text: string): Promise<void>;
  };

  const navigation: Navigation;
  const actions: Actions;
}

export {};
