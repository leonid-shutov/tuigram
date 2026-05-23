import * as _blessed from 'blessed';
import * as _opentui from '@opentui/core';
import { NeovimClient } from 'neovim';
import { TelegramClient } from '@mtcute/node';

import * as _timers from 'node:timers';
import * as _events from 'node:events';

declare global {
  const tui: typeof _opentui;
  const nvim: NeovimClient;

  namespace messenger {
    const tg: TelegramClient;
  }

  namespace node {
    const timers: typeof _timers;
    const events: typeof _events;
  }
}
