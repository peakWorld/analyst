import fs from 'fs-extra';
import _ from 'lodash';
import traverse from '@babel/traverse';
import generate, { type GeneratorOptions } from '@babel/generator';
import parser, { type ParserOptions } from '@babel/parser';
import type { Visitor, ParseResult } from '@babel/core';
import type { Context } from '../../../types/clipanion.js';
import { FileType } from '../../../types/constant.js';
import { t } from '../../../utils/index.js';

const BASE_OPTIONS: ParserOptions = {
  sourceType: 'module',
  plugins: ['jsx'],
};

export interface JsParserConfigs {
  type: FileType;
  code?: string;
  options?: ParserOptions;
}

export type JsVisitor = Visitor | ((ctx: Context, parser: JsParser) => Visitor);

export default class JsParser {
  private ast!: ParseResult;

  source!: string;

  originalOptions!: JsParserConfigs;

  constructor(protected ctx: Context, options: JsParserConfigs) {
    let sourceCode = options.code;
    if (!sourceCode) {
      sourceCode = fs.readFileSync(ctx.current.processing).toString();
    }
    this.source = sourceCode;
    this.originalOptions = options;
    this.parse();
  }

  mergeOptions() {
    // TODO 根据文件类型区分参数
    return _.merge({}, BASE_OPTIONS, this.originalOptions.options ?? {});
  }

  traverse(visitor: JsVisitor) {
    const v = t.isFunc(visitor) ? (<any>visitor)(this.ctx, this) : visitor; // TODO 类型断言
    traverse.default(this.ast, v);
  }

  parse() {
    const options = this.mergeOptions(); // 编译配置
    this.ast = parser.parse(this.source, options);
  }

  // retainLines 尽量保证行数一致
  generateCode(options: GeneratorOptions = { retainLines: true }) {
    const result = generate.default(this.ast, options);
    return result;
  }

  async generate() {}
}
