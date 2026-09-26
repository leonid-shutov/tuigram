const MAX_REDIRECTS = 2;

/** @type {typeof Fetch.text} */
async (url, headers) => {
  let target = url;
  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect++) {
    const response = await Fetch.once(target, headers);
    if (response === null) return null;

    if (response.status >= 300 && response.status < 400) {
      if (response.location === null || !response.location.startsWith('https://')) return null;
      target = response.location;
      continue;
    }

    return response.status >= 200 && response.status < 300 ? response.body : null;
  }
  return null;
};
