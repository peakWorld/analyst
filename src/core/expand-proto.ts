// TODO

// 有如下issue
// node_modules/vue-template-compiler/build.js
// ```js
// function genHandlers => 3775行要新增如下代码
// `if (!hasOwnProperty.call(events, name)) continue;`
// ```

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
    cb(this[k], k);
  }
};

Object.prototype._map = function (cb) {
  const result = {};
  for (const k in this) {
    if (!hasOwn.call(this, k)) continue;
    result[k] = cb(this[k], k);
  }
  return result as any;
};

Object.prototype._get = function (search, cb) {
  if (!cb) {
    cb = (v: string) => v.includes(search);
  }
  for (const tk in this) {
    if (!hasOwn.call(this, tk)) continue;
    if (cb(this[tk], tk)) return [this[tk], tk];
  }
  return [];
};

Object.prototype._getRandom = function () {
  const keys = Object.keys(this);
  const len = keys.length;
  const i = Math.floor(Math.random() * len);
  return this[keys[i]];
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

Object.prototype[Symbol.iterator] = function () {
  const keys = Object.keys(this);
  let i = 0;
  return {
    next() {
      return { done: i >= keys.length, value: keys[i++] };
    },
  };
};
