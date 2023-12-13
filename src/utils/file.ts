import path from 'node:path';
import fs from 'fs-extra';
import esbuild from 'esbuild';
import { wkspace } from './constant.js';
import { loadDynamicModule } from './common.js';

// 获取绝对路径地址
export function getAbsFileUrl(fileUrl: string, dirname = wkspace) {
  if (!path.isAbsolute(fileUrl)) {
    fileUrl = path.join(dirname, fileUrl);
  }
  return fileUrl;
}

// 读取json文件
export function readFileToJson<T>(fileUrl: string): Optinonal<T> {
  if (!fileUrl.endsWith('.json')) return undefined;
  const data = fs.readFileSync(fileUrl).toString();
  const configs = JSON.parse(data);
  return configs as T;
}

export async function readFileToExcuteJs(fileUrl: string) {
  const data = fs.readFileSync(fileUrl).toString();
  // 编译代码 => 还可使用--import
  const bundled = esbuild.transformSync(data, {
    loader: 'ts',
    platform: 'node',
    minify: true,
  });
  // 生成文件、再引入
  const fileUrlTmp = `${fileUrl}.timestamp-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}.mjs`;
  await fs.writeFile(fileUrlTmp, bundled.code);
  try {
    return await loadDynamicModule(fileUrlTmp);
  } finally {
    fs.unlink(fileUrlTmp);
  }
}
