(chunkSize) => AsyncIterator.map(messenger.tg.iterDialogs({ chunkSize }), Dialog.from);
