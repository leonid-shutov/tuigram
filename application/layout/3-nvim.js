nvim.on("mode", (mode) => {
  sections.dialog.component.setContent(mode);
  if (mode === "normal") layout.selectable = true;
  else layout.selectable = false;
});
