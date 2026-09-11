// A watermark: a read receipt only ever moves forward.
/** @type {ChatStore['setReadUpTo']} */
(maxReadId) => void (self.readUpTo = Math.max(self.readUpTo, maxReadId));
