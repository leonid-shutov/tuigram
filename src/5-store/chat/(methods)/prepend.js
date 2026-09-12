// `older` is oldest-first, so it lands contiguous with the head of the current window.
/** @type {ChatStore['prepend']} */
(older) => void self.messages.unshift(...older);
