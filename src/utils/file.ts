import path from 'path';
import fs from 'fs';
import { cwd } from './system.js';

// 从vue.config 或 vite.config 中获取配置信息
export function getConfigsInVueOrViteFile() {
// TODO
}

// 获取配置文件中的信息(json文件)
export function getConfigsByFile<T>(fileUrl: string) {
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
