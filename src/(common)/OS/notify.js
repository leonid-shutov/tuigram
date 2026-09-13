/** @type {Record<string, (title: string, text: string) => [string, string[]]>} */
const platforms = {
  linux: (title, text) => ['notify-send', ['--app-name=tuigram', title, text]],
  darwin: (title, text) => [
    'osascript',
    ['-e', `display notification ${JSON.stringify(text)} with title ${JSON.stringify(title)}`],
  ],
  win32: (title, text) => [
    'powershell',
    ['-NoProfile', '-Command', `New-BurntToastNotification -Text ${JSON.stringify(title)}, ${JSON.stringify(text)}`],
  ],
};

/** @type {typeof OS.notify} */
(title, body = '') => {
  const text = String(body).replace(/\s+/g, ' ').trim();
  const [cmd, args] = (platforms[process.platform] ?? platforms.linux)(title, text);
  spawnDetached('notify', cmd, args);
};
