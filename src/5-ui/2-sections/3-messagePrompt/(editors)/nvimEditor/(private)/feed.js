(event) => self.nvim.input(self.keycodes[event.name] ?? event.raw);
