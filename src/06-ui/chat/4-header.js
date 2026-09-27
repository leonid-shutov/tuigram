// `justifyContent: 'space-between'` pins the name left and the presence right without either
// setter knowing about the other; `headerName`'s `flexShrink` clips a long name before it can
// squeeze `headerPresence` (which never shrinks) off the edge.
Box({
  flexDirection: 'row',
  justifyContent: 'space-between',
  height: 1,
  marginX: 1,
  children: [self.headerName, self.headerPresence],
});
