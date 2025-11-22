(index) => {
  const childIndex = index + 1; // label is an extra child
  const item = module.container.children[childIndex];
  if (item !== undefined) item.style.bg = "red";
};
