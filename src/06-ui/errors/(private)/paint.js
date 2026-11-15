/** @type {ErrorsSelf['paint']} */
() => {
  self.detail.visible = self.expanded;
  self.component.bottomTitle = self.expanded ? ' ! dismiss ' : ' ! details ';
};
