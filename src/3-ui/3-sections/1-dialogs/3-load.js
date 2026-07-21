const chunkSize = 10;
Array.fromAsync(AsyncIterator.take(messenger.iterDialogs(chunkSize), chunkSize)).then(self.setDialogs);
void Array.fromAsync(messenger.iterDialogs()).then(self.setDialogs);
