import * as babel from '@babel/core';
import * as t from '@babel/types';
import Ast, { GET_AST_CONFIG } from '../index.js';
import { AstProjectOptions, ParsingCommonOptions } from '../../interface.js';
import {
  // saveToTmpFile,
  getAbsFileUrl,
  alias2AbsUrl,
  getIntegralPath,
  getDataAndDir,
} from '../../utils/index.js';

export interface Option extends AstProjectOptions, ParsingCommonOptions {}

export interface ParsingRsp {
  imports: string[];
  statics: string[];
  dyImports: string[];
}

export default (option: Option, plugins: babel.PluginItem[] = []) => {
  const AST_CONFIG = GET_AST_CONFIG();
  AST_CONFIG.configFile = false;
  AST_CONFIG.parserOpts.plugins.push('typescript');
  if (plugins?.length) {
    AST_CONFIG.plugins = [...AST_CONFIG.plugins, ...plugins];
  }

  return new Promise<ParsingRsp>((resolve) => {
    const { fileUrl, deps, aliasMap, alias, aliasBase } = option;
    let { codestr, dir } = option;
    if (fileUrl) {
      const { dir: dirname, data } = getDataAndDir(fileUrl);
      dir = dirname;
      codestr = data;
    }

    const ast = new Ast(codestr, AST_CONFIG);
    const visitor: babel.Visitor = {};
    const imports = new Set<string>();
    const statics = new Set<string>();

    async function onBeforeExit() {
      const importsRes = [];
      const staticsRes = [];
      let dyImportsRes = [];

      imports.forEach((importUrl) => {
        // 项目依赖 tdesign || tdesign/**/*.css
        if (deps.some((it) => it === importUrl || importUrl.startsWith(it)))
          return;
        // 别名 @/xx
        if (alias.some((it) => importUrl.includes(it))) {
          importsRes.push(alias2AbsUrl(importUrl, aliasMap, aliasBase));
          return;
        }
        // 相对路径 ./xx
        // 相对于entry的相对路径得出绝对路径
        importsRes.push(getAbsFileUrl(importUrl, dir));
      });

      statics.forEach((staticsUrl) => {
        if (alias.some((it) => staticsUrl.includes(it))) {
          staticsRes.push(alias2AbsUrl(staticsUrl, aliasMap, aliasBase));
          return;
        }
        staticsRes.push(getAbsFileUrl(staticsUrl, dir));
      });

      // 动态导入
      if (option.visitor) {
        const temps = await option.visitor(t, ast, fileUrl);
        if (temps?.length) {
          dyImportsRes = temps.map((it) =>
            // 别名处理
            alias2AbsUrl(it, aliasMap, aliasBase),
          );
        }
      }

      resolve({
        imports: importsRes.map((it) => getIntegralPath(it)),
        statics: staticsRes.map((it) => getIntegralPath(it)),
        dyImports: dyImportsRes.map((it) => getIntegralPath(it)),
      });
    }

    // 处理文件导入
    visitor.ImportDeclaration = (path) => {
      const { node } = path;
      imports.add(node.source.value); // 导入的路径
    };

    visitor.CallExpression = (path) => {
      // 处理静态资源
      if (
        t.isIdentifier(path.node.callee, { name: 'require' }) &&
        t.isStringLiteral(path.node.arguments[0])
      ) {
        statics.add(path.node.arguments[0].value);
      }
    };

    visitor.enter = (node) => {
      if (t.isProgram(node)) {
        // saveToTmpFile('file.json', node);
      }
    };

    visitor.exit = (node) => {
      if (t.isProgram(node)) {
        onBeforeExit();
      }
    };

    ast.run(visitor);
  });
};
