/************** Object.prototype ***************/

const hasOwn = Object.prototype.hasOwnProperty;

Object.prototype._merge = function (objs) {
  objs.forEach((obj) => {
    for (const k in obj) {
      if (!hasOwn.call(obj, k)) continue;
      this[k] = obj[k];
    }
  });
};

Object.prototype.merge_ = function (objs) {
  const result = {};
  result._merge([this, ...objs]);
  return result as any;
};

Object.prototype._forEach = function (cb) {
  for (const k in this) {
    if (!hasOwn.call(this, k)) continue;
    this[k] = cb(this[k]);
  }
};

Object.prototype._map = function (cb) {
  const result = {};
  result._merge([this]);
  result._forEach(cb);
  return result as any;
};

Object.prototype._get = function (search, cb) {
  if (!cb) {
    cb = (v: string) => v.includes(search);
  }
  for (const tk in this) {
    if (!hasOwn.call(this, tk)) continue;
    if (cb(this[tk])) return [this[tk], tk];
  }
  return undefined;
};

Object.prototype._filter = function (ks) {
  for (const k in this) {
    if (!hasOwn.call(this, k)) continue;
    if (ks.includes(k)) {
      delete this[k];
    }
  }
};

Object.prototype.filter_ = function (ks) {
  const result = {};
  for (const k in this) {
    if (!hasOwn.call(this, k)) continue;
    if (!ks.includes(k)) {
      result[k] = this[k];
    }
  }
  return result;
};
