/**
 * 1、废弃无用文件
 * 2、删除文件中的无用代码
 *
 * sable trash
 */
import Ast, { vueViteAst } from '../babelAst/index.js';
import Main from './main.js';
import { CommandOptions } from './interface.js';
import { getAbsFileUrl, getConfigsInVueOrViteFile } from '../utils/file.js';

export default async function setup(commandOptions: CommandOptions) {
  const { entryPath } = commandOptions;

  if (!entryPath) {
    console.log('必须配置entry');
    return;
  }
  const code_str = getConfigsInVueOrViteFile();
  if (code_str) {
    await vueViteAst(new Ast(code_str), { searchText: 'alias' });
  }

  const options = {
    entry: getAbsFileUrl(entryPath),
  };
  new Main(options);
}
