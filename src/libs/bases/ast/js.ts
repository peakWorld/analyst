import traverse from '@babel/traverse';
import generate, { type GeneratorOptions } from '@babel/generator';
import parser, { type ParserOptions } from '@babel/parser';
import type { Visitor, ParseResult } from '@babel/core';
import type { Context } from '../../../types/clipanion.js';

export default class BaseAstJs {
  private ast!: ParseResult;

  constructor(
    protected ctx: Context,
    protected sourceCode: string,
    protected options?: ParserOptions,
  ) {
    this.parse();
  }

  traverse(visitor: Visitor) {
    traverse.default(this.ast, visitor);
  }

  parse() {
    this.ast = parser.parse(this.sourceCode, this.options);
  }

  generate(options?: GeneratorOptions) {
    return generate.default(this.ast, options);
  }
}
