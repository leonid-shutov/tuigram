// Unlike downloadThumb, full media is fetched only to hand it to an external viewer, so it is
// not worth caching: a large video buffered once is a large video buffered forever.
/** @type {MessengerModule['downloadMedia']} */
(fileId) => messenger.tg.downloadAsBuffer(fileId);
