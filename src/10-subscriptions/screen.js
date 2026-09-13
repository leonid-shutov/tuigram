screen.renderer.on('focus', actions.windowFocus);
screen.renderer.on('blur', actions.windowBlur);
screen.renderer.on('resize', actions.repaintHints);
