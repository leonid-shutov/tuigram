const CACHE = node.path.join(node.os.tmpdir(), 'tuigram-media');

/** @param {FileMedia} media */
const fileNameFor = (media) => {
  const hash = Hash.fnv1a(media.fileId).toString(36);
  const name =
    media.fileName === null ? `media.${Media.extension(media.mimeType)}` : node.path.basename(media.fileName);
  return `${hash}-${name}`;
};

/** @param {string} file @param {FileMedia} media */
const fetchMedia = async (file, media) => {
  ui.chat.setStatus('downloading…');
  const bytes = await messenger.downloadMedia(media.fileId);
  await node.fs.promises.mkdir(CACHE, { recursive: true });
  const part = `${file}.part`;
  try {
    await node.fs.promises.writeFile(part, bytes);
    await node.fs.promises.rename(part, file);
  } catch (error) {
    await node.fs.promises.rm(part, { force: true });
    throw error;
  }
};

/** @type {Actions['openMedia']} */
async (media) => {
  const file = node.path.join(CACHE, fileNameFor(media));
  const opened = await Result.fromAsync(async () => {
    if (!node.fs.existsSync(file)) await fetchMedia(file, media);
    OS.open(file);
  });
  // Repaint first: it writes the same bottom title the notice does, so reporting last is what
  // keeps the notice on screen.
  actions.repaintReceipt();
  if (!opened.ok) actions.reportError(opened.error, 'Could not open the media.');
};
