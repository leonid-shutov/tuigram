/** @type {MessengerModule['iterDialogs']} */
({ chunkSize, archived = false } = {}) =>
  AsyncIterator.map(messenger.tg.iterDialogs({ chunkSize, archived: archived ? 'only' : 'exclude' }), Dialog.from);
