const DEFAULT_MS = 1200;

/** @type {ChatSection['flashStatus']} */
(status, ms = DEFAULT_MS) => self.component.flashTitlePart('status', status, ms);
