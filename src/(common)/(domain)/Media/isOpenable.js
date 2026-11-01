/** @type {typeof Media.isOpenable} */
(media) => Media.isFile(media) && media.type !== 'sticker';
