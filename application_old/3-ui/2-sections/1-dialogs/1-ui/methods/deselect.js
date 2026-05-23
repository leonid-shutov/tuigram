(index) => {
  const childIndex = index + 1; // label is an extra child
  const item = $.container.children[childIndex];
  if (item !== undefined) item.style.bg = undefined;
};
