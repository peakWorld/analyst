import fs from 'fs';
import { isObject } from './type.js';

// 处理循环引用对象
export function stringifyWithCircular(obj: Record<string, any>) {
  let cache = [];
  const str = JSON.stringify(obj, (_, value) => {
    if (isObject(value) && value !== null) {
      if (cache.includes(value)) return;
      cache.push(value);
    }
    return value;
  });
  cache = [];
  return str;
}

export function saveToCache(path: string, data: Record<string, any>) {
  const str = typeof data === 'string' ? data : stringifyWithCircular(data);
  fs.writeFileSync(`.cache/${path}`, str);
}
