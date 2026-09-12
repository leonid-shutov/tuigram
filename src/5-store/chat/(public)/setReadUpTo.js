/** @type {ChatStore['setReadUpTo']} */
(maxReadId) => void (self.readUpTo = Math.max(self.readUpTo, maxReadId));
