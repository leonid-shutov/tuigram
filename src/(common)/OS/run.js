/** @type {typeof OS.run} */
(cmd, args) => {
  const { promise, resolve, reject } = Promise.withResolvers();
  node.child_process.spawn(cmd, args, { stdio: 'inherit' }).on('exit', resolve).on('error', reject);
  return promise;
};
