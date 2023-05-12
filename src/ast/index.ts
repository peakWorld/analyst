import * as babel from '@babel/core';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

export const GET_AST_CONFIG = function (): babel.TransformOptions {
  // https://babeljs.io/docs/options babel可用配置参数
  return {
    // https://babeljs.io/docs/babel-parser#options babel/parser可用配置参数
    parserOpts: {
      sourceType: 'module',
      plugins: ['jsx'], // 扩展Babel解析器的功能, 可以解析某些语言的语法(jsx语法)
    },
    plugins: [], // 每一项是一个 Babel插件(插件会针对js代码进行某些转换操作[ES6语法、转换JSX、压缩代码等])
    presets: [], // 每一项是一个 预定义的Babel插件集合(打包成一个单独的Babel插件，按照特定的顺序应用于代码)
  };
};

export default class Ast {
  private ast!: babel.ParseResult;

  code_str!: string;

  options!: babel.TransformOptions;

  constructor(
    code_str: string,
    options: babel.TransformOptions = GET_AST_CONFIG(),
  ) {
    this.code_str = code_str;
    this.options = options;
    this.ast = babel.parseSync(code_str, options);
  }

  run(visitor: babel.Visitor) {
    traverse.default(this.ast, visitor);
  }

  generate(ast?: babel.Node, options: babel.GeneratorOptions = {}) {
    return generate.default(ast ?? this.ast, options);
  }
}
