import {
  createCliRenderer,
  Box,
  Text,
  ScrollBoxRenderable,
  RenderableEvents,
} from '@opentui/core';

const renderer = await createCliRenderer({ exitOnCtrlC: true });

const PALETTE = {
  bg: '#1a1b26',
  panel: '#1f2335',
  border: '#3b4261',
  accent: '#7aa2f7',
  muted: '#565f89',
  fg: '#c0caf5',
  dim: '#9aa5ce',
  ok: '#9ece6a',
  warn: '#e0af68',
  err: '#f7768e',
  info: '#7dcfff',
};

const LEVELS = [
  { name: 'INFO',  color: PALETTE.info },
  { name: 'OK',    color: PALETTE.ok   },
  { name: 'WARN',  color: PALETTE.warn },
  { name: 'ERROR', color: PALETTE.err  },
];

const SAMPLE_MESSAGES = [
  'request accepted on :8080',
  'cache miss, fetching from origin',
  'background job worker-3 picked up task',
  'flushed 128 events to sink',
  'db pool acquired connection (4/16 in use)',
  'gc pause 12ms (young gen)',
  'sse client connected from 10.0.0.42',
  'retry #2 after 503 from upstream',
  'deploy id b9f4 promoted to canary',
  'index build complete in 842ms',
  'rate limit reached for tenant ab12',
  'cron schedule "daily-report" triggered',
  'replica lag 1.4s, within threshold',
  'snapshot uploaded to s3://backups/2026/05/25/',
];

const pad = (n, w = 2) => String(n).padStart(w, '0');
const formatTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds() % 1000, 3)}`;
const pick = (xs) => xs[Math.floor(Math.random() * xs.length)];

// --- Log scroll box (the star of the show) ---

let stickyStart = 'bottom';

const logScroll = new ScrollBoxRenderable(renderer, {
  flexGrow: 1,
  scrollY: true,
  stickyScroll: true,
  stickyStart,
  focusable: true,
  viewportCulling: true,
  contentOptions: {
    flexDirection: 'column',
    paddingX: 1,
    paddingY: 0,
  },
  rootOptions: { backgroundColor: PALETTE.bg },
  scrollbarOptions: {
    showArrows: true,
    trackOptions: { foregroundColor: PALETTE.accent, backgroundColor: PALETTE.border },
  },
});

const MAX_ROWS = 200;
let counter = 0;
function appendLog() {
  const level = pick(LEVELS);
  const time = formatTime(new Date());
  const id = pad(++counter, 4);
  const msg = pick(SAMPLE_MESSAGES);

  const row = Box(
    { flexDirection: 'row', width: '100%', gap: 1 },
    Text({ content: time,             fg: PALETTE.dim    }),
    Text({ content: `#${id}`,          fg: PALETTE.muted  }),
    Text({ content: `[${level.name}]`, fg: level.color    }),
    Text({ content: msg,               fg: PALETTE.fg     }),
  );
  logScroll.add(row);

  const children = logScroll.content.getChildren();
  while (children.length > MAX_ROWS) children.shift().destroy();
}

// Seed some history so the box is not empty on launch.
for (let i = 0; i < 30; i++) appendLog();

// --- Live stream ---

let streamPaused = false;
let intervalMs = 600;

function tick() {
  if (!streamPaused) appendLog();
  setTimeout(tick, intervalMs);
}
tick();

// --- Status bar ---

const stickyLabel = Text({ content: '', fg: PALETTE.accent });
const streamLabel = Text({ content: '', fg: PALETTE.ok });
const scrollLabel = Text({ content: '', fg: PALETTE.dim });

function refreshStatus() {
  stickyLabel.content = `sticky: ${stickyStart}`;
  streamLabel.content = streamPaused ? 'stream: paused' : 'stream: running';
  streamLabel.fg = streamPaused ? PALETTE.warn : PALETTE.ok;
  const atEdge =
    stickyStart === 'bottom'
      ? logScroll.scrollTop + logScroll.viewport.height >= logScroll.scrollHeight - 1
      : logScroll.scrollTop <= 0;
  scrollLabel.content = `scroll: ${logScroll.scrollTop}/${Math.max(0, logScroll.scrollHeight - logScroll.viewport.height)} ${atEdge ? '· pinned' : '· detached'}`;
  scrollLabel.fg = atEdge ? PALETTE.ok : PALETTE.warn;
}

const statusBar = Box(
  {
    width: '100%',
    height: 1,
    flexDirection: 'row',
    gap: 2,
    paddingX: 1,
    backgroundColor: PALETTE.panel,
  },
  stickyLabel,
  streamLabel,
  scrollLabel,
);

// --- Help bar ---

const helpBar = Box(
  {
    width: '100%',
    height: 1,
    flexDirection: 'row',
    gap: 2,
    paddingX: 1,
    backgroundColor: PALETTE.panel,
  },
  Text({ content: '↑/↓ scroll', fg: PALETTE.dim }),
  Text({ content: 'g/G top/bottom', fg: PALETTE.dim }),
  Text({ content: 'space pause', fg: PALETTE.dim }),
  Text({ content: 't toggle edge', fg: PALETTE.dim }),
  Text({ content: 'c clear', fg: PALETTE.dim }),
  Text({ content: 'q quit', fg: PALETTE.dim }),
);

// --- Frame ---

const frame = Box(
  {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    borderStyle: 'rounded',
    borderColor: PALETTE.muted,
    title: ' Sticky Scroll Showcase ',
  },
  logScroll,
  statusBar,
  helpBar,
);

logScroll.on(RenderableEvents.FOCUSED, () => { frame.borderColor = PALETTE.accent; });
logScroll.on(RenderableEvents.BLURRED,  () => { frame.borderColor = PALETTE.muted;  });

renderer.root.add(frame);

// --- Keys ---

const defaultHandleKey = logScroll.handleKeyPress.bind(logScroll);
logScroll.handleKeyPress = (key) => {
  switch (key.name) {
    case 'space':
      streamPaused = !streamPaused;
      refreshStatus();
      return true;
    case 't':
      stickyStart = stickyStart === 'bottom' ? 'top' : 'bottom';
      logScroll.stickyStart = stickyStart;
      logScroll.scrollTo(stickyStart === 'bottom' ? logScroll.scrollHeight : 0);
      refreshStatus();
      return true;
    case 'c':
      for (const child of [...logScroll.content.getChildren()]) child.destroy();
      counter = 0;
      refreshStatus();
      return true;
    case 'q':
      process.exit(0);
  }
  return defaultHandleKey(key);
};

renderer.keyInput.on('keypress', () => refreshStatus());
setInterval(refreshStatus, 200);

logScroll.focus();
refreshStatus();
