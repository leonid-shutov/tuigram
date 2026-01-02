import * as _blessed from 'blessed';
import { NeovimClient } from 'neovim';
import { TelegramClient } from '@mtcute/node';

import * as _timers from 'node:timers';
import * as _events from 'node:events';

declare global {
  const blessed: typeof _blessed;
  const screen: typeof _blessed.Widgets.Screen;
  const nvim: NeovimClient;

  namespace messenger {
    const tg: TelegramClient;
  }

  namespace node {
    const timers: typeof _timers;
    const events: typeof _events;
  }
}
