/** @type {ChatSelf['up']} */
async () => {
  if (self.selectedIndex <= 0) await self.loadOlder();
  if (self.selectedIndex <= 0) return;
  self.selectMessage(self.selectedIndex - 1);

  // prefetch the next older page once the cursor nears the top of the window
  if (self.selectedIndex < 10) void self.loadOlder();
};
