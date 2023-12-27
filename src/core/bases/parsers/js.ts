import fs from 'fs-extra';
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
  code: string;
  options: ParserOptions;
}

export type JsVisitor = Visitor | ((ctx: Context) => Visitor);

export default class JsParser {
  private ast!: ParseResult;

  private _options!: ParserOptions;

  private mergeOptions() {
    // TODO 根据文件类型区分参数
    this._options = BASE_OPTIONS.merge_([this.options?.options ?? {}]);
  }

  constructor(
    protected ctx: Context,
    protected options?: Partial<JsParserConfigs>,
  ) {
    let sourceCode = options?.code;
    if (!sourceCode) {
      sourceCode = fs.readFileSync(ctx.current.processing).toString();
    }
    this.mergeOptions(); // 编译配置
    this.parse(sourceCode);
  }

  traverse(visitor: JsVisitor) {
    const v = t.isFunc(visitor) ? (<any>visitor)(this.ctx) : visitor; // TODO 类型断言
    traverse.default(this.ast, v);
  }

  parse(code: string) {
    this.ast = parser.parse(code, this._options);
  }

  generate(options?: GeneratorOptions) {
    return generate.default(this.ast, options);
  }
}
