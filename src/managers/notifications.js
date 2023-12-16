const noman = {
  _cache: [],
  add: (k, v) => {
    noman._cache.push({sender: k, data: v});
  },
  get: () => {
    const item = noman._cache[0];
    noman._cache.splice(noman._cache.indexOf(item), 1);
    return item;
  },
};

module.exports = noman;
