// The kickoff lives in the last-loaded layer so every section is already subscribed to the
// store before the first page of dialogs can resolve.
void store.dialogs.load();
