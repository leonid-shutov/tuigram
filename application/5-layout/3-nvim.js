nvim.on("mode", (mode) => {
  sections.chat.component.setContent(mode);
  if (mode === "normal") layout.selectable = true;
  else layout.selectable = false;
});

screen.on("keypress", (ch) => {
  if (module.reserved.includes(ch)) return;
  nvim.input(ch);
});
