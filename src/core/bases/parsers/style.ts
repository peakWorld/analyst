import fs from 'fs-extra';
import postcss from 'postcss';
import type { PluginCreator, Processor, ProcessOptions } from 'postcss';
import { FileType } from '../../../types/constant.js';
import { t } from '../../../utils/index.js';
import type { Context } from '../../../types/clipanion.js';

const BASE_OPTIONS: ProcessOptions = {
  from: undefined,
};

export interface StyleParserConfigs {
  type: FileType;
  code: string;
  options: ProcessOptions;
}

export type PluginCb = (ctx: Context) => PluginCreator<ProcessOptions>;
export type StyleVisitor = PluginCb | PluginCreator<ProcessOptions>;

export default class StyleParser {
  private processor!: Processor;

  private sourceCode!: string;

  private _options!: ProcessOptions;

  private async mergeOptions() {
    if (!this._options) {
      let syntax = null;
      switch (this.options?.type) {
        case FileType.Less:
          syntax = await import('postcss-less');
          break;
        case FileType.Scss:
          syntax = await import('postcss-scss');
          break;
        default:
      }
      this._options = syntax
        ? { ...BASE_OPTIONS, syntax }
        : { ...BASE_OPTIONS };
    }
    return this._options;
  }

  constructor(
    protected ctx: Context,
    protected options?: Partial<StyleParserConfigs>,
  ) {
    let sourceCode = options?.code;
    if (!sourceCode) {
      sourceCode = fs.readFileSync(ctx.current.processing).toString();
    }
    this.sourceCode = sourceCode;
    this.processor = postcss();
  }

  async traverse(plugin: StyleVisitor[]) {
    if (t.isArray(plugin)) {
      plugin.forEach((p) => {
        const tmp = <any>p;
        if (tmp.postcss) {
          this.processor.use(tmp);
        } else {
          this.processor.use(tmp(this.ctx));
        }
      });
    }
    await this.processor.process(this.sourceCode, await this.mergeOptions());
  }
}
