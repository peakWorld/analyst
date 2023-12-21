import fs from 'fs-extra';
import t from './check-type.js';
import { RouteType } from '../types/constant.js';
import type { ResolvedFrame, ResolvedRoute } from '../types/libs.js';

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

// 处理css文件, 可能携带～前缀
export function replaceAliasCss(alias: Record<string, string>, url: string) {
  if (url.startsWith('~')) {
    url = url.slice(1);
  }
  return replaceAlias(alias, url);
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

  if (!v) return '';

  url = url.replace(k, v);
  return url;
}

export function getMatchExtname(
  frame: Partial<ResolvedFrame>,
  matchCss = false,
) {
  if (matchCss) {
    let exts = ['css'];
    if (frame.less) {
      exts = [...exts, 'less'];
    }
    if (frame.scss) {
      exts = [...exts, 'scss'];
    }
    return exts;
  }

  let exts = ['ts', 'js'];
  if (frame.react) {
    exts = [...exts, 'tsx', 'jsx'];
  }
  if (frame.vue2 || frame.vue3) {
    exts = [...exts, 'vue'];
  }
  return exts;
}

// 根据路径和文件后缀 查找相应的系统文件
export function matchFileAbsUrls(fileUrl: string, exts: string[]) {
  // 路径存在
  if (fs.existsSync(fileUrl)) {
    const stat = fs.lstatSync(fileUrl);
    if (stat.isDirectory()) {
      return matchFileAbsUrls(`${fileUrl}/index`, exts);
    }
    return fileUrl;
  }

  return exts
    .filter((v) => fs.existsSync(`${fileUrl}.${v}`))
    .map((v) => `${fileUrl}.${v}`);
}

// 原生微信开发查找逻辑
export function matchFileAbsUrlsInWx(fileUrl: string, extraExts?: string[]) {
  let exts = ['js', 'json', 'wxss', 'wxml', 'wxs'];
  if (extraExts?.length) {
    exts = [...exts, ...extraExts];
  }
  return matchFileAbsUrls(fileUrl, exts);
}

export function checkIsFileUrl(codeOrUrl: string, exts: string[]) {
  return new RegExp(`.+\\.(${exts.join('|')})$`).test(codeOrUrl);
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
