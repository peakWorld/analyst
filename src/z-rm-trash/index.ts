/**
 * 1、废弃无用文件
 * 2、删除文件中的无用代码
 *
 * sable trash
 */
import Main from './main.js';
import { CommandOptions, Options } from './interface.js';
import {
  getAbsFileUrl,
  getConfigsInVueOrViteFile,
  pkageJson,
} from '../utils/index.js';
import astGetAlias from '../babelAst/visitors/vue-vite.js';

export default async function setup(commandOptions: CommandOptions) {
  const { entryPath } = commandOptions;

  if (!entryPath) {
    console.log('必须配置entry');
    return;
  }
  const options: Options = {
    entry: getAbsFileUrl(entryPath),
    deps: [],
    alias: [],
    aliasMap: {},
  };

  const code_str = getConfigsInVueOrViteFile();
  if (code_str) {
    const aliasMap = await astGetAlias({
      searchText: 'alias',
      codestr: code_str,
    });
    const alias = Object.keys(aliasMap);
    options.aliasMap = Object.keys(aliasMap).reduce((res, key) => {
      res[key] = getAbsFileUrl(aliasMap[key]);
      return res;
    }, {});
    options.alias = alias;
  }

  if (pkageJson) {
    const deps = Object.keys(pkageJson.dependencies);
    const depDevs = Object.keys(pkageJson.devDependencies);
    options.deps = [...deps, ...depDevs];
  }
  new Main(options);
}
