const CACHE = node.path.join(node.os.tmpdir(), 'tuigram-media');

/** @param {FileMedia} media */
const fileNameFor = (media) => {
  const hash = Hash.fnv1a(media.fileId).toString(36);
  const name =
    media.fileName === null ? `media.${Media.extension(media.mimeType)}` : node.path.basename(media.fileName);
  return `${hash}-${name}`;
};

/** @type {Actions['openMedia']} */
async () => {
  const media = ui.chat.selectedMessage?.media ?? null;
  if (media === null || !Media.isFile(media) || media.type === 'sticker') return;

  const file = node.path.join(CACHE, fileNameFor(media));
  try {
    if (!node.fs.existsSync(file)) {
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
    }
    OS.open(file);
  } catch (error) {
    // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
    const reason = /** @type {Error} */ (error).message ?? String(error);
    console.log('[openMedia] failed:', reason);
    OS.notify('tuigram', `Could not open the media: ${reason}`);
  } finally {
    actions.repaintReceipt();
  }
};
