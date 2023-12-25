import path from 'node:path';
import fs from 'fs-extra';
import { wkspace } from './constant.js';
import type { ResolvedFrame } from '../types/libs.js';

/**
 * 根据frame细分 getAbsByMatchExts函数要匹配的文件后缀
 */
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

/**
 * 获取文件的绝对路径(css别名路径)
 */
export function getAbsByAliasInCss(alias: Record<string, string>, url: string) {
  // 可能携带～前缀
  if (url.startsWith('~')) {
    url = url.slice(1);
  }
  return getAbsByAlias(alias, url);
}

/**
 * 获取文件的绝对路径(别名路径)
 *
 * 根据alias别名, 将路径替换成绝对路径
 * alias: { @/x: '/xx' }
 * url: @/x/abc.js | @/x/ab
 *
 * /xx/abc.js | /xx/ab
 */
export function getAbsByAlias(alias: Record<string, string>, url: string) {
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

/**
 * 获取文件的绝对路径(无后缀)
 *
 * 由绝对路径、可能的文件后缀 => 查找相应的系统文件
 * fileUrl: /xxx/xx
 * exts: [.js, .ts]
 * 判断 /xxx/xx.js | /xxx/xx.ts 是否存在, 存在即返回
 */
export function getAbsByMatchExts(fileUrl: string, exts: string[]) {
  // 路径存在
  if (fs.existsSync(fileUrl)) {
    const stat = fs.lstatSync(fileUrl);
    if (stat.isDirectory()) {
      return getAbsByMatchExts(`${fileUrl}/index`, exts);
    }
    return fileUrl;
  }

  return exts
    .filter((v) => fs.existsSync(`${fileUrl}.${v}`))
    .map((v) => `${fileUrl}.${v}`);
}

/**
 * 获取文件的绝对路径(有后缀)
 *
 * fileUrl: ./xx.js | xx.js
 * prefix: /xx
 *
 * 相对于prefix获取绝对路径 /xx/x.js
 */
export function getAbsHasExt(fileUrl: string, prefix = wkspace) {
  if (path.isAbsolute(fileUrl)) return fileUrl;

  if (/\.{1,2}\//.test(fileUrl) && prefix === wkspace)
    return fs.realpathSync(fileUrl);

  return path.join(prefix, fileUrl);
}

// 原生微信开发查找逻辑
export function matchFileAbsUrlsInWx(fileUrl: string, extraExts?: string[]) {
  let exts = ['js', 'json', 'wxss', 'wxml', 'wxs'];
  if (extraExts?.length) {
    exts = [...exts, ...extraExts];
  }
  return getAbsByMatchExts(fileUrl, exts);
}

export function checkIsFileUrl(codeOrUrl: string, exts: string[]) {
  return new RegExp(`.+\\.(${exts.join('|')})$`).test(codeOrUrl);
}
