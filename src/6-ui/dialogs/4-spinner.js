const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const INTERVAL_MS = 120;

let frame = 0;
self.component.bottomTitle = ` ${FRAMES[frame]} `;

node.timers
  .setInterval(() => {
    frame = (frame + 1) % FRAMES.length;
    self.component.bottomTitle = ` ${FRAMES[frame]} `;
  }, INTERVAL_MS)
  .unref();
