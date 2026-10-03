const FOLDER_UPDATES = new Set(['updateDialogFilter', 'updateDialogFilters', 'updateDialogFilterOrder']);

/** @type {MessengerModule['onFoldersChange']} */
(handler) =>
  messenger.dispatcher.onRawUpdate(
    (_client, update) => FOLDER_UPDATES.has(update._),
    () => handler(),
  );
