/**
 * 1、废弃无用文件
 * 2、删除文件中的无用代码
 *
 * sable trash
 */
import fs from 'fs';
import Main from './main.js';
import {
  getAbsFileUrl,
  getConfigsInVueOrViteFile,
  getIntegralPath,
  executeEs,
  pkageJson,
  getCacheFile,
  // saveToTmpFile,
} from '../utils/index.js';
import astGetAlias from '../ast/visitors/vue-vite.js';
import type { CommandOptions, MainOptions, FileConfig } from './interface.js';

export default async function setup(commandOptions: CommandOptions) {
  const { entry } = commandOptions;
  const configFile = getIntegralPath(
    getAbsFileUrl(entry ?? getCacheFile('.trash')),
  );
  console.vlog('configFile', configFile);
  if (!fs.existsSync(configFile)) {
    return console.error(`配置文件不存在 => ${configFile}`);
  }
  const configs: FileConfig = await executeEs(configFile);

  const options: MainOptions = {
    entry: getAbsFileUrl(configs.entry),
    deps: [],
    alias: [],
    aliasMap: {},
    aliasBase: configs.aliasBase ?? '@',
  };

  // 获取项目中的别名alias
  let aliasMap = {};
  const code_str = getConfigsInVueOrViteFile();
  if (code_str) {
    aliasMap = await astGetAlias({
      searchText: 'alias',
      codestr: code_str,
    });
  }
  if (configs.alias) {
    aliasMap = { ...aliasMap, ...configs.alias };
  }
  if (Object.keys(aliasMap).length) {
    const alias = Object.keys(aliasMap);
    options.aliasMap = Object.keys(aliasMap).reduce((res, key) => {
      res[key] = getAbsFileUrl(aliasMap[key]);
      return res;
    }, {});
    options.alias = alias;
  }

  // 获取项目中的package.json
  if (pkageJson) {
    const deps = Object.keys(pkageJson.dependencies);
    const depDevs = Object.keys(pkageJson.devDependencies);
    options.deps = [...deps, ...depDevs];
  }
  // saveToTmpFile('trash-options.json', options);
  console.vlog('options', options);
  new Main(options);
}
