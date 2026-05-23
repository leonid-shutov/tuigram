() => {
  if ($.loading) return;
  $.addMessage({ loading: true, text: 'Loading...', author: 'me' });
  $.loading = true;
};
