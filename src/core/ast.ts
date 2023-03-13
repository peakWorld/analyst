import * as babel from '@babel/core';
// import traverse from '@babel/traverse';
// import * as t from '@babel/types';

export const AST_CONFIG: babel.TransformOptions = {
  parserOpts: {
    sourceType: 'module',
    plugins: ['jsx'],
    allowImportExportEverywhere: true,
  },
};

export default class Ast {

  constructor(private options: babel.TransformOptions = AST_CONFIG) {}

  run() {
    console.log('options', this.options);
  }
}


