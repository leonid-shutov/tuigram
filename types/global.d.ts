import * as _blessed from "blessed";
import { NeovimClient } from "neovim";
import { TelegramClient } from "@mtcute/node";

import * as _timers from "node:timers";

declare global {
  const blessed: typeof _blessed;
  const screen: typeof _blessed.Widgets.Screen;
  const nvim: NeovimClient;
  const tg: TelegramClient;

  namespace state {
    const mode: "normal" | "insert";
    const selected: "messagePrompt";
  }

  namespace node {
    const timers: typeof _timers;
  }
}
