/** @type {ChatSection['setStatus']} */
(status) => void (self.component.bottomTitle = status === null ? undefined : ` ${status} `);
