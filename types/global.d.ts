import * as _blessed from 'blessed';
import * as _opentui from '@opentui/core';
import { NeovimClient } from 'neovim';
import { Message, TelegramClient } from '@mtcute/bun';

import * as _timers from 'node:timers';
import * as _events from 'node:events';
import * as _crypto from 'node:crypto';

declare global {
  const tui: typeof _opentui;
  const nvim: NeovimClient;

  namespace messenger {
    const tg: TelegramClient;
    const sendMessage: (chatId: string, text: string) => Promise<Message>;
  }

  namespace node {
    const timers: typeof _timers;
    const events: typeof _events;
    const crypto: typeof _crypto;
  }
}
