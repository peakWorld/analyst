import * as babel from '@babel/core';
import * as t from '@babel/types';
import proposalDecorators from '@babel/plugin-proposal-decorators';
import Ast, { GET_AST_CONFIG } from '../index.js';
import { DyParsingRsp, Context, TransARUrl } from '../../interface.js';
import { setAddArrItem } from '../../../utils/index.js';

export default (
  codestr: string,
  context: Context,
  plugins: babel.PluginItem[] = [],
) => {
  const AST_CONFIG = GET_AST_CONFIG();
  AST_CONFIG.configFile = false;
  AST_CONFIG.parserOpts.plugins.push('typescript');
  AST_CONFIG.plugins.push([proposalDecorators, { legacy: true }]);
  if (plugins?.length) {
    AST_CONFIG.plugins = [...AST_CONFIG.plugins, ...plugins];
  }

  return new Promise<DyParsingRsp>((resolve) => {
    const ast = new Ast(codestr, AST_CONFIG);
    const visitor: babel.Visitor = {};
    const imports = new Set<string>();
    const statics = new Set<string>();
    const dyImports = new Set<string>();
    const { $utils } = context;

    async function onBeforeExit() {
      const rsp: DyParsingRsp = { imports: [], statics: [], dyImports: [] };

      if (imports.size) {
        rsp.imports = Array.from(imports);
      }

      if (statics.size) {
        rsp.statics = Array.from(statics);
        $utils.addStaticUrl(rsp.statics);
      }

      if (dyImports.size) {
        rsp.dyImports = Array.from(dyImports);
        $utils.addDynamicsUrl(rsp.dyImports);
      }

      resolve(rsp);
    }

    // 处理静态导入 import xx
    visitor.ImportDeclaration = {
      enter(path) {
        const { node } = path;
        const rsp = $utils.transfromAliasOrRelativeUrl({
          url: node.source.value,
          checkDeps: true,
        });
        setAddArrItem(imports, rsp);
      },
    };

    visitor.CallExpression = (path) => {
      const { callee } = path.node;
      const arg0 = path.node.arguments[0];

      if (!t.isIdentifier(callee, { name: 'require' }) && !t.isImport(callee))
        return;

      const params = { useGlob: true } as TransARUrl;
      if (t.isStringLiteral(arg0)) {
        params.url = arg0.value;
      }
      if (t.isTemplateLiteral(arg0)) {
        params.url = ast.tmplate2Glob(arg0);
        params.originUrl = ast.generateNode(arg0);
      }
      const rsp = $utils.transfromAliasOrRelativeUrl(params);
      setAddArrItem(t.isImport(callee) ? dyImports : statics, rsp);
    };

    // visitor.enter = (node) => {
    //   if (t.isProgram(node)) {
    //     saveToTmpFile('file.json', node);
    //   }
    // };

    visitor.exit = (node) => {
      if (t.isProgram(node)) {
        onBeforeExit();
      }
    };

    ast.run(visitor);
  });
};
