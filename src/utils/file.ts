import path from 'path';
import fs from 'fs';
import { cwd, sablePwd } from './system.js';
import { vuePCF } from '../consts/migrate-file.js';

// 从vue.config 或 vite.config 中获取配置信息
export function getConfigsInVueOrViteFile() {
  const configFile = vuePCF.filter((it) => fs.existsSync(it))[0];
  if (configFile) {
    const config = fs.readFileSync(configFile).toString();
    console.vlog('getConfigsInVueOrViteFile config', config);
  }
}

// 获取配置文件中的信息(json文件)
export function getOptionsByFile<T>(fileUrl: string) {
  let uri = fileUrl;
  const ext = path.extname(uri);
  if (!ext) {
    uri += '.json';
  }
  const isAbsolutePath = path.isAbsolute(fileUrl);
  if (!isAbsolutePath) {
    uri = path.join(cwd, uri);
  }
  const configs = JSON.parse(fs.readFileSync(uri).toString());
  console.vlog(`配置文件路径 => ${uri}`);
  return configs as T;
}

export function saveToTmpFile(fileName: string, data: string) {
  const url = path.join(sablePwd, `.tmp/${fileName}`);
  fs.writeFileSync(url, data);
}
