import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileToJson } from './file.js';

const _filename = fileURLToPath(import.meta.url);

// 命令行相关
export const space = _filename.split('/build')[0];

export const getPkgJson = () =>
  readFileToJson<PackageJson>(path.join(space, 'package.json'));

export const isDebug = process.env.NODE_ENV == 'debug';

// 工作区间相关
export const wkspace = process.cwd();

export const wkName = path.basename(wkspace);

export const getWkPkgJson = () =>
  readFileToJson<PackageJson>(path.join(wkspace, 'package.json'));
