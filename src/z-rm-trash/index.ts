/**
 * 1、废弃无用文件
 * 2、迁移文件
 * 3、删除无用代码
 *
 * sable trash
 */
import fs from 'fs';
import Main from './main.js';
import {
  getAbsFileUrl,
  getConfigsInVueOrViteFile,
  getPendingSuffix,
  executeEs,
  pkageJson,
  getCacheFile,
  isArray,
  isString,
  // saveToTmpFile,
} from '../utils/index.js';
import astGetAlias from './ast/visitors/vue-vite.js';
import type {
  CommandOptions,
  MainOptions,
  FileConfig,
  Rewrite,
} from './interface.js';

export default async function setup(commandOptions: CommandOptions) {
  const { entry } = commandOptions;
  // TODO
  const configFileUrl = getAbsFileUrl(entry ?? getCacheFile('.trash'));
  const suffix = getPendingSuffix(configFileUrl);
  const configFile = `${configFileUrl}${suffix}`;

  console.vlog('configFile', configFile);
  if (!fs.existsSync(configFile)) {
    return console.error(`配置文件不存在 => ${configFile}`);
  }
  const configs: FileConfig = await executeEs(configFile);
  // TODO configs的默认配置

  const options: MainOptions = {
    entry: getAbsFileUrl(configs.entry),
    deps: [],
    alias: [],
    aliasMap: {},
    aliasBase: configs.aliasBase ?? '@',
    include: [],
    migrate: {},
  };

  let aliasMap = {};
  // 是否读取项目编译配置文件
  if (configs.readConfig ?? true) {
    const code_str = getConfigsInVueOrViteFile();
    if (code_str) {
      aliasMap = await astGetAlias({
        searchText: 'alias',
        codestr: code_str,
      });
    }
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

  // 项目 可处理区域
  let include = [getAbsFileUrl('src')];
  const migrate = {};
  if (configs.include?.length) {
    include = configs.include.map((it) => getAbsFileUrl(it));
  }
  // 剔除include中的重复路径
  function handleRewrite(aliasKey: string, rewrite: ExcludeItemArr<Rewrite>) {
    migrate[rewrite.from] = {
      to: rewrite.to ?? rewrite.from,
      dirname: getAbsFileUrl(rewrite.dirname),
    };
    const url = options.aliasMap[aliasKey];
    if (include.some((it) => url.startsWith(it))) return;
    include.push(url);
  }
  if (configs.rewrite) {
    configs.rewrite.forEach((item) => {
      const { from, to, dirname } = item;
      if (isArray(from)) {
        from.forEach((it) => handleRewrite(it, { from: it, to, dirname }));
      } else if (isString(from)) {
        handleRewrite(from, { from, to, dirname });
      }
    });
  }
  options.include = include;
  options.migrate = migrate;

  console.vlog('options', options);
  // saveToTmpFile('options.json', options);
  new Main(options);
}
