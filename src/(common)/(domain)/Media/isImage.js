/** @type {typeof Media.isImage} */
(media) => media !== null && (media.type === 'photo' || media.type === 'video');
