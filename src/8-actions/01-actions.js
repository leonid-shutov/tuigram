// The open chat's history pager and its reentrancy flag. All async lives in this module, so
// the store can stay synchronous and the view can stay unaware that paging exists.
({ pager: undefined, loadingMore: false });
