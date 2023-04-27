import * as babel from '@babel/core';
import traverse from '@babel/traverse';
// import * as t from '@babel/types';
export { default as vueViteAst } from './visitors/vue-vite.js';

export const AST_CONFIG: babel.TransformOptions = {
  parserOpts: {
    sourceType: 'module',
    plugins: ['jsx'],
    allowImportExportEverywhere: true,
  },
};

export default class Ast {
  private ast!: babel.ParseResult;

  constructor(
    private code_str: string,
    private options: babel.TransformOptions = AST_CONFIG,
  ) {
    this.ast = babel.parseSync(this.code_str, this.options);
  }

  run(visitor: babel.Visitor) {
    traverse.default(this.ast, visitor);
  }
}
