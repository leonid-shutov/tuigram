// Long enough that a page answered from the local cache never flickers the border.
const DELAY_MS = 150;

/** @type {ChatSection['spin']} */
() => {
  self.spinner = self.component.spinTitlePart('status', DELAY_MS);
  return self.spinner;
};
