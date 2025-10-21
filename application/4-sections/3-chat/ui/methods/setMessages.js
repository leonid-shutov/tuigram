(messages) => {
  const content = messages.map((message) => message.text).join("\n\n");
  module.container.setContent(content);
  screen.render();
};
