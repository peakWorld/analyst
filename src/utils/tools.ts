import path from 'path';
import * as babel from '@babel/core';
import commonjs from '@babel/plugin-transform-modules-commonjs';
import transform from '@babel/plugin-transform-typescript';
import { isObject } from './type.js';
import { readData } from './file.js';
import { sablePwd, pkageJson } from './system.js';

// 处理循环引用对象
export function stringifyWithCircular(obj: Record<string, any>) {
  let cache = [];
  const str = JSON.stringify(obj, (_, value) => {
    if (isObject(value) && value !== null) {
      if (cache.includes(value)) return;
      cache.push(value);
    }
    return value;
  });
  cache = [];
  return str;
}

// 剔除ts代码中的类型声明, 且将esm代码转换为commomjs代码
export function executeEs(fileUrl: string) {
  const data = readData(fileUrl);
  const res = babel.transformSync(data, {
    configFile: false,
    plugins: [commonjs, transform],
  });
  return eval(`const exports = {}; ${res.code}`)();
}

// 获取cache中的文件配置
export function getCacheFile(fileName = '') {
  return path.join(sablePwd, './.cache', pkageJson.name, fileName);
}
