// A user-made folder's title is their own text, in whatever language they wrote it. The archive's
// is one of our labels, so it follows the interface language.
/** @type {typeof Folder.title} */
(folder) =>
  folder.id === Folder.ARCHIVE.id
    ? Locale.t(
        // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
        /** @type {Locale.TextLabel} */ (folder.title),
      )
    : folder.title;
