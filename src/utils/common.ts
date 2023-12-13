import t from './check-type.js';

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

// 加载动态模块
export async function loadDynamicModule<T>(moduleUrl: string) {
  return (await import(moduleUrl)).default as T;
}

// 从package.json获取模块版本
export function getVersion(version: string) {
  const [_, v] = /^[~^]?(\d)/.exec(version);
  return Number(v);
}

// 根据alias, 将url替换成绝对路径
export function replaceAlias(alias: Record<string, string>, url: string) {
  const alias64 = alias['@']; // '@' 64
  const alias65 = alias['~']; // '～' 65374

  if (['@/', '~/'].find((it) => url.startsWith(it))) {
    if (alias64) {
      url = url.replace('@', alias64);
    }
    if (alias65) {
      url = url.replace('~', alias65);
    }
    return url;
  }

  const aliasTmp = alias.filter_(['@', '~']);
  const [v, k] = aliasTmp._get(url, (v) => url.startsWith(v));
  url = url.replace(k, v);
  return url;
}
