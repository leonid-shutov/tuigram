/** @type {() => NvimEditorSelf['capturing']} */
() => (self.mode ?? 'normal') !== 'normal';
