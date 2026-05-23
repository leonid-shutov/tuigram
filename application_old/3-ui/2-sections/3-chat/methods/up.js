async () => {
  const shouldLoadMore = !$.state.loading && $.state.messagesLeft === 3;
  if (shouldLoadMore) {
    //console.dir('loadMore');
    $.state.startLoading();
    $.state.iterator.next().then(({ value, done }) => {
      if (done) return void $.state.stopLoading();
      $.state.uploadMessages(value);
      $.render();
    });
  }

  $.state.up();
  $.render();
};
