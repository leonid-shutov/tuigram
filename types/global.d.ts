import * as _blessed from 'blessed';
import * as _opentui from '@opentui/core';
import { NeovimClient } from 'neovim';
import { Message, TelegramClient } from '@mtcute/node';
import { Dispatcher } from '@mtcute/dispatcher';

import * as _timers from 'node:timers';
import * as _events from 'node:events';
import * as _crypto from 'node:crypto';
import * as _fs from 'node:fs';
import * as _os from 'node:os';
import * as _path from 'node:path';

declare global {
  const tui: typeof _opentui;
  const nvim: NeovimClient;

  namespace screen {
    const renderer: _opentui.CliRenderer;
    const wrapper: _opentui.BoxRenderable;
  }

  namespace auth {
    const tg: TelegramClient;
    const credentials: { apiId: number; apiHash: string };
  }

  namespace messenger {
    const tg: TelegramClient;
    const dispatcher: Dispatcher;
    const sendMessage: (chatId: string, text: string) => Promise<Message>;
    const getReadOutboxMaxId: (chatId: string) => Promise<number>;
  }

  namespace node {
    const timers: typeof _timers;
    const events: typeof _events;
    const crypto: typeof _crypto;
    const fs: typeof _fs;
    const os: typeof _os;
    const path: typeof _path;
  }
}
