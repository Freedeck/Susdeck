const noman = {
  _cache: [],
  add: (k, v) => {
    noman._cache.push({sender: k, data: v});
  },
  get: () => {
    return noman._cache.shift();
  },
};

module.exports = noman;
