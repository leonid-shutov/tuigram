screen.renderer.on('focus', Guard.soft(actions.windowFocus, 'Something went wrong.'));
screen.renderer.on('blur', Guard.soft(actions.windowBlur, 'Something went wrong.'));
screen.renderer.on('resize', Guard.soft(actions.repaintHints, 'Something went wrong.'));
