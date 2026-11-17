// Measured as close to the way opentui draws as `string-width` gets, so text lines up with what it
// draws. Since 0.6 opentui measures natively; string-width 9 agrees with it everywhere checked
// except Indic conjuncts (क्षि, स्त्री: wider here) and the soft hyphen (no cell here, one there),
// and on a terminal where opentui picks its `wcwidth` method, skin tones and ZWJ sequences.
/** @type {typeof Cells.width} */
(text) => npm['string-width'](text);
