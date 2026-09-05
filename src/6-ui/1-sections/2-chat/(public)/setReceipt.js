/** @type {ChatSection['setReceipt']} */
(receipt) => {
  self.component.bottomTitle = receipt === null ? undefined : ` ${receipt} `;
};
