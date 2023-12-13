import path from 'node:path';
import { createRequire } from 'node:module';
import fs from 'fs-extra';
import esbuild from 'esbuild';
import { wkspace } from './constant.js';

const _require = createRequire(import.meta.url);

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
  return configs;
}

// 加载动态模块(esm|cjs)
export async function loadDynamicModule<T>(moduleUrl: string, isEsm: boolean) {
  if (isEsm) return (await import(moduleUrl)).default as T;
  return _require(moduleUrl); // (默认)可加载.js|.json|.node文件
}

// 适用于单文件
export async function bundleFileToCode(fileUrl: string, isEsm: boolean) {
  const data = fs.readFileSync(fileUrl).toString();
  // 编译代码 => 还可使用--import
  const bundled = esbuild.transformSync(data, {
    platform: 'node',
    format: isEsm ? 'esm' : 'cjs',
    minify: true,
  });
  return bundled.code;
}

export async function readFileToExcuteJs(fileUrl: string, isEsm = true) {
  if (isEsm) {
    const bundledCcode = await bundleFileToCode(fileUrl, true);
    // 生成文件、再引入
    const fileUrlTmp = `${fileUrl}.timestamp-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}.mjs`;
    await fs.writeFile(fileUrlTmp, bundledCcode);
    try {
      return await loadDynamicModule(fileUrlTmp, true);
    } finally {
      fs.unlink(fileUrlTmp);
    }
  } else {
    return await loadDynamicModule(fileUrl, false);
  }
}
