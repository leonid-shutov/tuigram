/** @type {ErrorsSelf['paint']} */
() => {
  self.detail.visible = self.expanded;
  self.component.bottomTitle = self.expanded ? ' alt+e dismiss ' : ' alt+e details ';
};
