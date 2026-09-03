/** @type {typeof UiDialog.preview} */
({ text, media }) => {
  if (text !== '') return text;
  else if (media !== undefined && media !== null) return Media.placeholder(media);
  else return '';
};
