const NOTICE_MS = 3000;

/** @type {Actions['reportError']} */
(error, notice) => {
  Crash.soft(error);
  void ui.chat.flashStatus(notice, NOTICE_MS);
};
