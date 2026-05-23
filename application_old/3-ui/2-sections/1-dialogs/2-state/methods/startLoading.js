() => {
  if ($.loading) return;
  $.addDialog({ loading: true, name: 'Loading...', lastMessage: 'Loading...' });
  $.loading = true;
};
