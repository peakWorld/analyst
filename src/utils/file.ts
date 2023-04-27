import path from 'path';
import fs from 'fs-extra';
import { cwd, sablePwd } from './system.js';
import { vuePCF } from '../consts.js';
import { stringifyWithCircular } from './tools.js';
import { isObject } from './type.js';

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
  uri = getAbsFileUrl(fileUrl);
  const configs = JSON.parse(fs.readFileSync(uri).toString());
  console.vlog(`配置文件路径 => ${uri}`);
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

export function getAbsFileUrl(fileUrl: string) {
  let uri = fileUrl;
  if (!path.isAbsolute(uri)) {
    uri = path.join(cwd, uri);
  }
  return uri;
}
