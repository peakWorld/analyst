import path from 'node:path';
import _ from 'lodash';
import fs from 'fs-extra';
import { wkspace } from './constant.js';
import { FileType } from '../types/constant.js';
import type { ResolvedFrame } from '../types/libs.js';
import type { Context } from '../types/clipanion.js';

export function getStyleFileTye(frame: Partial<ResolvedFrame>) {
  const exts = [FileType.Css];
  if (frame.less) exts.push(FileType.Less);
  if (frame.scss) exts.push(FileType.Scss);
  return exts;
}

/**
 * 根据frame细分 getAbsByMatchExts函数要匹配的文件后缀
 */
export function getMatchFileType(
  frame: Partial<ResolvedFrame>,
  withCss = false,
) {
  let exts = [];
  if (withCss) {
    exts = getStyleFileTye(frame);
  }
  exts.push(FileType.Js);
  if (frame.ts) exts.push(FileType.Ts);
  if (frame.react) {
    exts.push(FileType.Jsx);
    if (frame.ts) exts.push(FileType.Tsx);
  }
  if (frame.vue2 || frame.vue3) {
    exts.push(FileType.Vue);
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
 * 获取绝对路径(别名路径)
 *
 * 根据alias别名, 将路径替换成绝对路径 => 结果可能无后缀
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

  const aliasTmp = _.omit(alias, ['@', '~']);
  const tmp = _.pickBy(aliasTmp, (v) => url.startsWith(v));
  if (_.isEmpty(tmp)) return '';
  const [[k, v]] = _.toPairs(tmp);
  url = url.replace(k, v);
  return url;
}

/**
 * 获取绝对路径(无后缀)
 *
 * 由绝对路径、可能的文件后缀 => 查找相应的系统文件
 * fileUrl: /xxx/xx
 * exts: [js, ts]
 * 判断 /xxx/xx.js | /xxx/xx.ts 是否存在, 存在即返回
 */
export function getAbsByMatchExts(fileUrl: string, exts: FileType[]) {
  // 路径存在
  if (fs.existsSync(fileUrl)) {
    const stat = fs.lstatSync(fileUrl);
    if (stat.isDirectory()) {
      return getAbsByMatchExts(`${fileUrl}/index`, exts);
    }
    return [fileUrl];
  }

  return exts
    .filter((v) => fs.existsSync(`${fileUrl}.${v}`))
    .map((v) => `${fileUrl}.${v}`);
}

/**
 * 获取绝对路径(相对路径)
 *
 * fileUrl: ./xx.js | xx.js
 * prefix: /xx
 *
 * 相对于prefix获取绝对路径 /xx/x.js
 */
export function getAbsByRelative(fileUrl: string, prefix = wkspace) {
  if (path.isAbsolute(fileUrl)) return fileUrl;

  if (isInRelative(fileUrl) && prefix === wkspace)
    return fs.realpathSync(fileUrl);

  return path.join(prefix, fileUrl);
}

// 原生微信开发查找逻辑
export function matchFileAbsUrlsInWx(fileUrl: string, extraExts?: FileType[]) {
  let exts = [
    FileType.Js,
    FileType.Json,
    FileType.Wxss,
    FileType.Wxml,
    FileType.Wxs,
  ];
  if (extraExts?.length) {
    exts = [...exts, ...extraExts];
  }
  return getAbsByMatchExts(fileUrl, exts);
}

export function checkIsFileUrl(codeOrUrl: string, exts: string[]) {
  return new RegExp(`.+\\.(${exts.join('|')})$`).test(codeOrUrl);
}

export function isInAlias(alias: Record<string, string>, url: string) {
  if (['@/', '~/'].find((it) => url.startsWith(it))) return true;
  const aliasTmp = _.omit(alias, ['@', '~']);
  if (Object.keys(aliasTmp).some((k) => url.startsWith(k))) return true;
  return false;
}

export function isInRelative(url: string) {
  return /^\.{1,2}\//.test(url);
}

/**
 * 将别名或相对路径 转成绝对路径
 *
 * @/xx/x[.js] | ../xx[.js] => /../xx.js
 */
export function getAbsUrlInAst(ctx: Context, fileUrl: string, inStyle = false) {
  let urls = [];
  const { frames, alias } = ctx.configs;

  const exts = inStyle
    ? getStyleFileTye(frames)
    : getMatchFileType(frames, true);

  if (isInAlias(alias, fileUrl)) {
    urls = getAbsByMatchExts(getAbsByAlias(alias, fileUrl), exts);
  }
  if (isInRelative(fileUrl)) {
    urls = getAbsByMatchExts(
      getAbsByRelative(fileUrl, path.dirname(ctx.current.processing)),
      exts,
    );
  }
  return urls;
}
