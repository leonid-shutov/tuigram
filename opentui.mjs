import { createCliRenderer, TextRenderable, Text } from "@opentui/core";

const renderer = await createCliRenderer();

// Raw Renderable
const greeting = new TextRenderable(renderer, {
  id: "greeting",
  content: "Hello, OpenTUI!",
  fg: "#00FF00",
  position: "absolute",
  left: 10,
  top: 5,
});

renderer.root.add(greeting);

// Construct/Component (VNode)
const greeting2 = Text({
  content: "Hello, OpenTUI!",
  fg: "#00FF00",
  position: "absolute",
  left: 10,
  top: 5,
});

renderer.root.add(greeting);
