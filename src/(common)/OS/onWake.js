const TICK_MS = 5_000;
// Well over any event-loop stall, so only a real freeze counts.
const SLACK_MS = 30_000;

// Node's timers run on the monotonic clock, which stops while the machine is suspended, so no
// timer can tell a suspend happened. The wall clock keeps going: a tick that finds far more time
// gone than it waited means the process was frozen in between.
/** @type {typeof OS.onWake} */
(handler) => {
  let last = Date.now();
  node.timers
    .setInterval(() => {
      const now = Date.now();
      const frozen = now - last > TICK_MS + SLACK_MS;
      last = now;
      if (frozen) handler();
    }, TICK_MS)
    .unref();
};
