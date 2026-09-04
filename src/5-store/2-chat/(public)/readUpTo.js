// Highest outgoing message id the peer has read. The chat draws its receipt from this and
// `newest()`; the watermark itself stays private so nothing can write it behind `setReadUpTo`.
/** @type {ChatStore['readUpTo']} */
() => self.readMaxId;
