import * as babel from '@babel/core';
import * as t from '@babel/types';
import Ast, { GET_AST_CONFIG } from '../index.js';
import {
  AstProjectOptions,
  ParsingCommonOptions,
  ParsingRsp,
} from '../../interface.js';
import {
  getDataAndDir,
  transfromFileUrl,
  // saveToTmpFile,
} from '../../utils/index.js';

export interface Option extends AstProjectOptions, ParsingCommonOptions {}

export interface DyParsingRsp extends ParsingRsp {
  dyImports: string[];
}

export default (options: Option, plugins: babel.PluginItem[] = []) => {
  const AST_CONFIG = GET_AST_CONFIG();
  AST_CONFIG.configFile = false;
  AST_CONFIG.parserOpts.plugins.push('typescript');
  if (plugins?.length) {
    AST_CONFIG.plugins = [...AST_CONFIG.plugins, ...plugins];
  }

  return new Promise<DyParsingRsp>((resolve) => {
    const { fileUrl, deps } = options;
    let { codestr, dir } = options;
    if (fileUrl) {
      const { dir: dirname, data } = getDataAndDir(fileUrl);
      dir = dirname;
      codestr = data;
    }

    const ast = new Ast(codestr, AST_CONFIG);
    const visitor: babel.Visitor = {};
    const imports = new Set<string>();
    const statics = new Set<string>();
    const dyImports = new Set<string>();

    async function onBeforeExit() {
      const rsp: DyParsingRsp = { imports: [], statics: [], dyImports: [] };

      if (imports.size) {
        rsp.imports = transfromFileUrl(
          { fileUrls: imports, dir, options, deps },
          true,
          true,
        );
      }

      if (statics.size) {
        rsp.statics = transfromFileUrl(
          { fileUrls: statics, dir, options },
          true,
        );
      }

      if (dyImports.size) {
        rsp.dyImports = transfromFileUrl(
          { fileUrls: dyImports, dir, options },
          true,
        );
      }

      resolve(rsp);
    }

    // 处理静态导入 import xx
    visitor.ImportDeclaration = (path) => {
      const { node } = path;
      imports.add(node.source.value); // 导入的路径
    };

    visitor.CallExpression = (path) => {
      const { callee } = path.node;
      const arg0 = path.node.arguments[0];
      // 处理静态资源 require('xx')
      if (t.isIdentifier(callee, { name: 'require' })) {
        if (t.isStringLiteral(arg0)) {
          statics.add(arg0.value);
        }
        if (t.isTemplateLiteral(arg0)) {
          const tmpFileUrl = ast.tmplate2Glob(arg0);
          if (tmpFileUrl) {
            statics.add(tmpFileUrl);
          }
        }
      }

      // 处理动态import('xx' | 'xx${xx}xx')
      if (t.isImport(callee)) {
        if (t.isStringLiteral(arg0)) {
          dyImports.add(arg0.value);
        }

        if (t.isTemplateLiteral(arg0)) {
          const tmpFileUrl = ast.tmplate2Glob(arg0);
          if (tmpFileUrl) {
            dyImports.add(tmpFileUrl);
          }
          // saveToTmpFile('dy-tmp-import.json', path.node);
        }
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
