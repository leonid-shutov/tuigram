const THUMB = config.theme.borderChars ? '#' : config.theme.borderStyle === 'heavy' ? '█' : '┃';
const TRACK = config.theme.borderChars?.vertical ?? tui.BorderChars[config.theme.borderStyle].vertical;
const THUMB_FG = tui.parseColor(config.theme.thumb);
const TRACK_FG = tui.parseColor(config.theme.muted);
const BG = tui.parseColor(config.theme.bg);

/** @param {import('@opentui/core').TextRenderable} text */
const thumbOf = ({ height, scrollHeight, scrollY, maxScrollY }) => {
  const length = Math.max(1, Math.round((height * height) / scrollHeight));
  const room = height - length;
  let start = Math.round((scrollY / maxScrollY) * room);
  if (room >= 2) {
    if (scrollY > 0) start = Math.max(1, start);
    if (scrollY < maxScrollY) start = Math.min(room - 1, start);
  }
  return { start, end: start + length };
};

/** @type {typeof Bubble.drawScrollbar} */
(view, buffer) => {
  const { box, text } = view;
  if (!text.visible || text.maxScrollY === 0) return;
  const { start, end } = thumbOf(text);
  const x = box.screenX + box.width - 1;
  for (let row = 0; row < text.height; row++) {
    const y = text.screenY + row;
    const onThumb = row >= start && row < end;
    if (box.focused) buffer.drawText(onThumb ? THUMB : TRACK, x, y, onThumb ? THUMB_FG : TRACK_FG, BG);
    else if (onThumb) buffer.drawText(THUMB, x, y, box.borderColor, BG);
  }
};
