() => (self.list.options = [...self.pinned, ...self.unpinned].map(Dialog.toOption));
