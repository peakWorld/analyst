import fs from 'fs-extra';
import {
  traverse,
  parse,
  type Visitor,
  type AstNode,
  type RootNode,
  type ParserOptions,
} from '../../../lib/postxml/index.js';
import { FileType } from '../../../types/constant.js';
import { t } from '../../../utils/index.js';
import type { Context } from '../../../types/clipanion.js';

export interface XmlParserConfigs {
  type: FileType;
  code: string;
  options: any;
}

const BASE_OPTIONS: ParserOptions = {};

export type TemplateVisitor = Visitor | ((ctx: Context) => Visitor);

export default class TemplateParser {
  private ast!: AstNode;

  private _options!: ParserOptions;

  private mergeOptions() {
    this._options = BASE_OPTIONS.merge_([this.options?.options ?? {}]);
  }

  constructor(
    protected ctx: Context,
    protected options?: Partial<XmlParserConfigs>,
  ) {
    let sourceCode = options?.code;
    if (!sourceCode) {
      sourceCode = fs.readFileSync(ctx.current.processing).toString();
    }
    this.mergeOptions(); // 编译配置
    this.parse(sourceCode);
  }

  traverse(visitor: TemplateVisitor) {
    const v = t.isFunc(visitor) ? (<any>visitor)(this.ctx) : visitor; // TODO 类型断言
    traverse(this.ast, v);
  }

  parse(code: string) {
    console.log('this.parse', code);
    // this.ast = parse(code, this._options) as RootNode;
    console.log('this.parse', this.ast);
  }
}
