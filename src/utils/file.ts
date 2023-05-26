import path from 'path';
import fs from 'fs-extra';
import { cwd, sablePwd } from './system.js';
import { stringifyWithCircular } from './tools.js';
import { isObject } from './type.js';
import { vuePCF, EXTS, LANG } from '../consts.js';

// 从vue.config 或 vite.config 中获取配置信息
export function getConfigsInVueOrViteFile() {
  const configFile = vuePCF.filter((it) => fs.existsSync(it))[0];
  console.vlog('项目配置文件路径', configFile);
  if (!configFile) return '';
  const config = fs.readFileSync(configFile).toString();
  return config;
}

// 获取配置文件中的信息(json文件)
export function getOptionsByFile<T>(fileUrl: string) {
  let uri = fileUrl;
  const ext = path.extname(uri);
  if (!ext) {
    uri += '.json';
  }
  const configs = JSON.parse(readData(uri));
  return configs as T;
}

export function saveToTmpFile(
  fileName: string,
  data: string | Record<string, any>,
) {
  const output = isObject(data) ? stringifyWithCircular(data) : data;
  const url = path.join(sablePwd, `.tmp/${fileName}`);
  fs.writeFileSync(url, output);
}

// 获取绝对路径地址
export function getAbsFileUrl(fileUrl: string, dirname = cwd) {
  let uri = fileUrl;
  if (!path.isAbsolute(uri)) {
    uri = path.join(dirname, uri);
  }
  return uri;
}

export function alias2AbsUrl(
  importUrl: string,
  aliasMap: Record<string, string>,
  aliasBase: string,
) {
  const alias = Object.keys(aliasMap).filter((it) => it !== aliasBase); // 先匹配非根别名
  const matchAlias =
    alias.filter((it) => importUrl.startsWith(it))[0] ?? aliasBase;
  const particalUrl = importUrl.replace(matchAlias, aliasMap[matchAlias]);
  return particalUrl;
}

// 校验路径所在文件是否存在
export function getIntegralPath(fileUrl: string, exts = EXTS) {
  const uri = fileUrl;
  // 路径存在
  if (fs.existsSync(uri)) {
    const stat = fs.lstatSync(uri); // 信息
    // 文件夹
    if (stat.isDirectory()) {
      return getIntegralPath(`${uri}/index`);
    }
    return uri;
  }
  // 路径不存在 加后缀[.ext]
  const ext = exts.filter((ext) => fs.existsSync(`${uri}${ext}`))[0];
  if (!ext) {
    console.vlog(`不存在文件: ${uri}`);
    return;
  }
  return `${uri}${ext}`;
}

export function readData(fileUrl: string) {
  return fs.readFileSync(getAbsFileUrl(fileUrl)).toString();
}

export function getDataAndDir(fileUrl: string) {
  const codestr = readData(fileUrl);
  const dirUrl = path.dirname(fileUrl);
  const ext = path.extname(fileUrl).slice(1);
  return [codestr, dirUrl, ext] as [string, string, LANG];
}

// 将模板转成glob语句
// `xx/${*}/xx.js` => `xx/**/xx.js`
export function template2Glob(fileUrl: string) {
  const tmpUrl = fileUrl.replace(/[${}`]/g, '');
  const parsed = path.parse(tmpUrl);
  const { dir } = parsed;
  if (/\*/.test(dir)) {
    parsed.dir = dir.replace(/\*/g, '**');
  }
  return path.format(parsed);
}

export function isDts(fileUrl: string) {
  return fileUrl?.endsWith('.d.ts');
}
