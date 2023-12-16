const tsm = {
  _set: {},
  set: (k, v) => tsm._set[k] = v,
  get: (k, v) => tsm._set[k],
  delete: (k) => delete tsm._set[k],
};

module.exports = tsm;
