for (const section of Object.values(sections)) {
  screen.append(section.component);
}
screen.render();

node.timers.setTimeout(() => {
  sections.sideBar.component.append(
    blessed.box({
      //top: items.length * 4, // vertical spacing
      left: 1,
      width: "95%",
      height: 5,
      tags: true,
      content: `{bold}title{/bold}\n{red-fg}description{/}`,
      style: {
        bg: "black",
        fg: "white",
        border: { fg: "gray" },
      },
      border: "line",
    }),
  );
  screen.render();
}, 2000);
