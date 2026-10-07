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
  if (!node.fs.existsSync(file)) {
    ui.chat.setStatus('downloading…');
    const download = messenger.downloadMedia(media.fileId).then((bytes) => Cache.write(file, bytes));
    const downloaded = await Result.fromPromise(download);
    ui.chat.clearStatus();
    if (!downloaded.ok) return void ui.errors.report('Could not open the media.', downloaded.error);
  }
  const opened = Result.from(() => OS.open(file));
  if (!opened.ok) ui.errors.report('Could not open the media.', opened.error);
};
