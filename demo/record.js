'use strict';

// Records the README / Reddit demo: `npm run demo:record`. Writes docs/demo.gif, and an MP4 for
// sites that play video better than GIFs (its path is printed).
//
// The demo (demo/run.js, with the scene in demo/scene.js) runs in a real kitty, so photos draw as
// pixels through kitty's graphics protocol. kitty sits on a virtual X display (Xvfb) that only
// exists in memory: nothing opens on the desktop, and the recording looks the same on any machine.
// Keys go in through kitty's remote control; ffmpeg films the display; gifski makes the GIF.
//
// The app's notifications are in the picture too: dunst draws them on the same display. It sits on
// a D-Bus of this run's own, which can't start any service, so nothing reaches the desktop's bus,
// its notification daemon or its portals.
//
// Needs Xvfb, kitty, dbus-daemon, dunst, ffmpeg, gifski, and the CaskaydiaMono Nerd Font.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, execFileSync } = require('node:child_process');
const { setTimeout: sleep } = require('node:timers/promises');
const { typed } = require('./scene.js');

const ROOT = path.join(__dirname, '..');
const GIF = path.join(ROOT, 'docs', 'demo.gif');

// Twice the size of the GIF, so text stays sharp once scaled down.
const WIDTH = 2400;
const HEIGHT = 1440;
const GIF_WIDTH = 1600;
const FPS = 30;
const GIF_FPS = 15;
// The default theme's colours (aqua-lime, src/01-config/themes/definitions.js), for what the
// recording draws around the app.
const theme = { bg: '#041016', surface: '#08222b', fg: '#e6ffff', border: '#22d3ee' };
// kitty's own background: the sliver below the last row, where the cell grid doesn't divide the
// height, then matches the app.
const GROUND = theme.bg;
// kitty here doesn't redraw once a large image has finished arriving: the app has sent the photo
// and its placement, yet it shows only at kitty's next redraw of its own, such as the one a key
// press causes (shown on 2026-11-14 with a byte replay; whether a desktop kitty does the same is
// open). So from launch, kitty is asked to redraw at this interval, by re-setting its background
// to the colour it already has: nothing reaches the app, and the scene needs no extra keys. Starting
// before the camera has a photo loaded off camera already on screen in the first frame.
const REDRAW = 250;
// From the launch until the app has drawn its chat list; none of it is filmed.
const STARTUP = 5000;
const TYPING = 70;

// A step: `wait` ms, a kitty key name to press, text to type (`speed` ms a key), the `cue` that
// starts the family's news (demo/scene.js), or `dismiss` to clear the notifications.
// Off camera, after STARTUP: Hanna's chat is open when filming starts.
const SETUP = [{ key: 'j' }, { wait: 400 }, { key: 'enter' }, { wait: 2500 }];
// On camera.
const SCENE = [
  { wait: 2500 }, // Hanna's aquarium photo
  { cue: true }, // Sis, Mom and Dad, a notification each; Family jumps up the list
  { wait: 4200 },
  { key: 'ctrl+p' }, // over to Family
  { wait: 500 },
  { type: 'fam', speed: 160 },
  { wait: 600 },
  { key: 'enter', dismiss: true }, // Sis passed her driving test; the notifications are read
  { wait: 3000 },
  { key: '3' }, // the message box
  { wait: 400 },
  { type: typed },
  { wait: 500 },
  { key: 'enter' },
  { wait: 5000 }, // Dad types, and answers
];

// Notifications as the GIF shows them: the theme's surface and border, the terminal's font, stacked
// in the top right corner over the message pane. They stay until the scene dismisses them all at
// once: one expiring alone has dunst move the rest up, and without a compositor a frame can catch
// that half drawn (a popup twice).
const DUNSTRC = `[global]
    monitor = 0
    follow = none
    origin = top-right
    offset = (40, 56)
    width = 640
    height = (0, 260)
    notification_limit = 4
    gap_size = 12
    padding = 18
    horizontal_padding = 22
    frame_width = 3
    frame_color = "${theme.border}"
    separator_height = 0
    corner_radius = 14
    font = "CaskaydiaMono Nerd Font 17"
    markup = full
    format = "<b>%s</b>\\n%b"
    word_wrap = yes
    ellipsize = end
    icon_position = off
    show_age_threshold = -1
    sort = no
    stack_duplicates = false
    indicate_hidden = no

[urgency_normal]
    background = "${theme.surface}"
    foreground = "${theme.fg}"
    timeout = 0
`;

// A session bus with no service directories: it can't start anything, so the app's notifications
// reach dunst or nobody.
const BUS = `<!DOCTYPE busconfig PUBLIC "-//freedesktop//DTD D-Bus Bus Configuration 1.0//EN"
 "http://www.freedesktop.org/standards/dbus/1.0/busconfig.dtd">
<busconfig>
  <type>session</type>
  <listen>unix:tmpdir=/tmp</listen>
  <auth>EXTERNAL</auth>
  <policy context="default">
    <allow send_destination="*" eavesdrop="true"/>
    <allow eavesdrop="true"/>
    <allow own="*"/>
  </policy>
</busconfig>
`;

const need = ['Xvfb', 'kitty', 'dbus-daemon', 'dunst', 'dunstctl', 'ffmpeg', 'gifski'];

const has = (command) => {
  try {
    execFileSync('sh', ['-c', `command -v ${command}`], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

/** The first X display number with no server on it. */
const freeDisplay = () => {
  for (let number = 90; number < 200; number++) {
    if (!fs.existsSync(`/tmp/.X${number}-lock`)) return number;
  }
  throw new Error('record: no free X display between :90 and :199');
};

const waitFor = async (check, what, timeout = 10_000) => {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    if (check()) return;
    await sleep(100);
  }
  throw new Error(`record: timed out waiting for ${what}`);
};

const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const exited = (child) =>
  new Promise((resolve) => {
    child.once('exit', resolve);
  });

const run = (command, args) => {
  execFileSync(command, args, { stdio: ['ignore', 'ignore', 'inherit'] });
};

void (async () => {
  const missing = need.filter((command) => !has(command));
  if (missing.length > 0) throw new Error(`record: install ${missing.join(', ')} first`);

  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'tuigram-record-'));
  const raw = path.join(work, 'raw.mkv');
  const mp4 = path.join(work, 'demo.mp4');
  const pidFile = path.join(work, 'app.pid');
  const cue = path.join(work, 'cue');
  const display = `:${freeDisplay()}`;
  const socket = `unix:@tuigram-record-${process.pid}`;
  const started = [];
  let bus = 0;

  // Only what this run started: the demo (npm, whose pid the shell wrote before exec'ing it, and
  // node under it), then kitty and Xvfb. Never anything found by name: `npm run demo` may well be
  // running in another terminal.
  const stop = () => {
    const app = fs.existsSync(pidFile) ? Number(fs.readFileSync(pidFile, 'utf8')) : 0;
    if (app > 0) {
      try {
        execFileSync('pkill', ['-P', String(app)], { stdio: 'ignore' });
      } catch {
        // No children left.
      }
      try {
        process.kill(app);
      } catch {
        // Already gone.
      }
    }
    for (const child of started.toReversed()) if (child.exitCode === null) child.kill();
    if (bus > 0 && alive(bus)) process.kill(bus);
  };
  process.once('SIGINT', () => {
    stop();
    process.exit(130);
  });

  try {
    const xvfb = spawn('Xvfb', [display, '-screen', '0', `${WIDTH}x${HEIGHT}x24`, '-nolisten', 'tcp'], {
      stdio: 'ignore',
    });
    started.push(xvfb);
    await waitFor(() => fs.existsSync(`/tmp/.X11-unix/X${display.slice(1)}`), 'Xvfb');

    // A clean environment: nothing of this terminal's (TMUX, TERM, WAYLAND_DISPLAY, its D-Bus) may
    // change how the app inside kitty draws, or where its notifications go.
    const base = {
      HOME: os.homedir(),
      PATH: process.env.PATH,
      USER: os.userInfo().username,
      LANG: process.env.LANG ?? 'C.UTF-8',
      DISPLAY: display,
    };
    fs.writeFileSync(path.join(work, 'bus.conf'), BUS);
    fs.writeFileSync(path.join(work, 'dunstrc'), DUNSTRC);
    const daemon = ['--config-file', path.join(work, 'bus.conf'), '--fork', '--print-address=1', '--print-pid=1'];
    const [address, pid] = execFileSync('dbus-daemon', daemon, { env: base, encoding: 'utf8' }).trim().split('\n');
    bus = Number(pid);
    const env = { ...base, DBUS_SESSION_BUS_ADDRESS: address };
    started.push(spawn('dunst', ['-config', path.join(work, 'dunstrc')], { env, stdio: 'ignore' }));
    Object.assign(env, {
      KITTY_DISABLE_WAYLAND: '1',
      TUIGRAM_DEMO_SCENE: '1',
      TUIGRAM_DEMO_NOTIFY: '1',
      TUIGRAM_DEMO_CUE: cue,
    });
    // --config NONE: none of this machine's kitty.conf; every setting the look depends on is here.
    const options = [
      'font_family=CaskaydiaMono Nerd Font Mono',
      'font_size=24',
      `background=${GROUND}`,
      'window_padding_width=0',
      'placement_strategy=top-left',
      `initial_window_width=${WIDTH}`,
      `initial_window_height=${HEIGHT}`,
      'remember_window_size=no',
      'cursor_blink_interval=0',
      'enable_audio_bell=no',
      'confirm_os_window_close=0',
      'allow_remote_control=yes',
    ];
    const kittyArgs = ['--config', 'NONE', '--listen-on', socket, '--directory', ROOT];
    for (const option of options) kittyArgs.push('-o', option);
    const launch = `echo $$ > '${pidFile}'; exec npm run --silent demo`;
    const kitty = spawn('kitty', [...kittyArgs, 'sh', '-c', launch], { env, stdio: 'ignore' });
    started.push(kitty);

    const kitten = (...args) => run('kitty', ['@', '--to', socket, ...args]);
    const redraw = setInterval(() => {
      spawn('kitty', ['@', '--to', socket, 'set-colors', `background=${GROUND}`], { stdio: 'ignore' });
    }, REDRAW);
    redraw.unref();
    const play = async (steps) => {
      for (const step of steps) {
        if (step.wait !== undefined) await sleep(step.wait);
        if (step.key !== undefined) kitten('send-key', step.key);
        if (step.cue) fs.writeFileSync(cue, '');
        if (step.dismiss) execFileSync('dunstctl', ['close-all'], { env, stdio: 'ignore' });
        if (step.type !== undefined) {
          for (const character of step.type) {
            kitten('send-text', '--', character);
            await sleep(step.speed ?? TYPING);
          }
        }
      }
    };
    await waitFor(() => fs.existsSync(pidFile), 'the demo to start');
    await sleep(STARTUP);
    await play(SETUP);

    const ffmpegArgs = ['-loglevel', 'error', '-y', '-f', 'x11grab', '-framerate', String(FPS)];
    ffmpegArgs.push('-video_size', `${WIDTH}x${HEIGHT}`, '-i', display);
    // Lossless, in full colour: the encodes below are what lose anything.
    ffmpegArgs.push('-c:v', 'libx264rgb', '-preset', 'ultrafast', '-crf', '0', raw);
    const camera = spawn('ffmpeg', ffmpegArgs, { stdio: ['pipe', 'ignore', 'inherit'] });
    started.push(camera);
    await sleep(300);

    await play(SCENE);

    // ffmpeg finishes the file on `q`; a kill would leave it without an index.
    clearInterval(redraw);
    camera.stdin.end('q');
    await exited(camera);
    // Quit as a user would, so the demo removes its temp home on the way out; stop() is for a hang.
    kitten('send-key', 'ctrl+c');
    const app = Number(fs.readFileSync(pidFile, 'utf8'));
    await waitFor(() => !alive(app), 'the demo to quit', 5000).catch(() => {});
    stop();

    const gifArgs = ['--quiet', '--fps', String(GIF_FPS), '--quality', '90', '--width', String(GIF_WIDTH)];
    run('gifski', [...gifArgs, '-o', GIF, raw]);
    run('ffmpeg', [
      '-loglevel',
      'error',
      '-y',
      '-i',
      raw,
      '-vf',
      `scale=${GIF_WIDTH}:-2:flags=lanczos`,
      '-c:v',
      'libx264',
      '-crf',
      '18',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      mp4,
    ]);
    fs.rmSync(raw);
    process.stdout.write(`${path.relative(ROOT, GIF)}\n${mp4}\n`);
  } catch (error) {
    stop();
    throw error;
  }
})();
