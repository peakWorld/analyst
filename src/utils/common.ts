import t from './check-type.js';
import { RouteType } from '../types/constant.js';

export function upperFirstCase(str: string) {
  return str.slice(0, 1).toLocaleUpperCase() + str.slice(1);
}

export function proxy<T extends Record<string | symbol, any>>(target: T): T {
  return new Proxy(target, {
    get(target, key) {
      const val = target[key];
      if (t.isFunc(val)) {
        return val.bind(target);
      }
      return val;
    },
  });
}

// 从package.json获取模块版本
export function getVersion(version: string) {
  const [_, v] = /^[~^]?(\d)/.exec(version);
  return Number(v);
}

export function isTsFile(fileName: string) {
  return fileName.endsWith('.ts') || fileName.endsWith('.d.ts');
}

// 处理循环引用对象
export function stringifyWithCircular(obj: AnyObj) {
  let cache = [];
  const str = JSON.stringify(obj, (_, value) => {
    if (t.isObject(value) && value !== null) {
      if (cache.includes(value)) return;
      cache.push(value);
    }
    if (t.isMap(value)) {
      const record = {};
      Array.from(value.keys()).forEach((k) => (record[k] = value.get(k)));
      return record;
    }
    if (t.isSet(value)) {
      return Array.from(value);
    }
    return value;
  });
  cache = [];
  return str;
}

export function setRoute(fileUrl: string, path?: string, extra?: AnyObj) {
  const type = !!path ? RouteType.Reality : RouteType.Virtual;
  return { path, fileUrl, type, extra };
}
