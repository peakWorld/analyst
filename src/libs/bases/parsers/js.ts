import path from 'node:path';
import fs from 'fs-extra';
import traverse from '@babel/traverse';
import generate, { type GeneratorOptions } from '@babel/generator';
import parser, { type ParserOptions } from '@babel/parser';
import type { Visitor, ParseResult } from '@babel/core';
import type { Context } from '../../../types/clipanion.js';
import { t } from '../../../utils/index.js';

const BASE_OPTIONS: ParserOptions = {
  sourceType: 'module',
  plugins: ['jsx'],
};

export type TVisitor = Visitor | ((ctx: Context) => Visitor);

export default class JsParser {
  private ast!: ParseResult;

  protected sourceCode!: string;

  protected fileUrl!: string;

  private async setup() {
    // 判断文件
    const isFileUrl = path.isAbsolute(this.codeOrFileUrl);
    this.sourceCode = isFileUrl
      ? fs.readFileSync(this.codeOrFileUrl).toString()
      : this.codeOrFileUrl;
    // 编译配置
    this.setConfigs();
    this.parse();
  }

  private setConfigs() {
    this.options = BASE_OPTIONS.merge_([this.options ?? {}]);
  }

  constructor(
    protected ctx: Context,
    protected codeOrFileUrl: string,
    protected options?: ParserOptions,
  ) {
    this.setup();
  }

  traverse(visitor: TVisitor) {
    const v = t.isFunc(visitor) ? (<any>visitor)(this.ctx) : visitor; // TODO 类型断言
    traverse.default(this.ast, v);
  }

  parse() {
    this.ast = parser.parse(this.sourceCode, this.options);
  }

  generate(options?: GeneratorOptions) {
    return generate.default(this.ast, options);
  }
}
