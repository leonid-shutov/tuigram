/** @type {Record<string, (path: string) => [string, string[]]>} */
const openers = {
  linux: (path) => ['xdg-open', [path]],
  darwin: (path) => ['open', [path]],
  win32: (path) => ['cmd', ['/c', 'start', '', path]],
};

/** @type {typeof OS.open} */
(path) => {
  const [cmd, args] = (openers[process.platform] ?? openers.linux)(path);
  spawnDetached('open', cmd, args);
};
