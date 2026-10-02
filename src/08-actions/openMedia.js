const CACHE = node.path.join(config.paths.cache, 'media');

/** @param {FileMedia} media */
const fileNameFor = (media) => {
  const hash = Hash.fnv1a(media.fileId).toString(36);
  const name =
    media.fileName === null ? `media.${Media.extension(media.mimeType)}` : node.path.basename(media.fileName);
  return `${hash}-${name}`;
};

/** @type {Actions['openMedia']} */
async (media) => {
  const file = node.path.join(CACHE, fileNameFor(media));
  const opened = await Result.fromAsync(async () => {
    if (!node.fs.existsSync(file)) {
      ui.chat.setStatus('downloading…');
      await Cache.write(file, await messenger.downloadMedia(media.fileId));
    }
    OS.open(file);
  });
  // Repaint first: it writes the same bottom title the notice does, so reporting last is what
  // keeps the notice on screen.
  actions.repaintReceipt();
  if (!opened.ok) ui.errors.report('Could not open the media.', opened.error);
};
