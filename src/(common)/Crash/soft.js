/** @type {typeof Crash.soft} */
(error, notice) => {
  const detail = error instanceof Error ? String(error.stack ?? error) : String(error);
  console.log(notice === undefined ? detail : `${notice}\n${detail}`);
  if (notice !== undefined) OS.notify('tuigram', notice);
};
