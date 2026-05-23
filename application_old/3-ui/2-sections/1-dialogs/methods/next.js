() => {
  const shouldLoadMore = !$.state.hasDialogs || $.state.dialogsLeft === 3;
  if (shouldLoadMore) {
    $.state.startLoading();
    $.loadMore().then((moreDialogs) => {
      $.state.uploadDialogs(moreDialogs);
      $.ui.setDialogs($.state.getDialogs());
    });
  }

  const updatedDialogs = $.state.next();
  $.ui.setDialogs(updatedDialogs);
};
