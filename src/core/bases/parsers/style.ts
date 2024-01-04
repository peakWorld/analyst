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

export type PluginCb = (
  ctx: Context,
  parser: StyleParser,
) => PluginCreator<ProcessOptions>;
export type StyleVisitor = PluginCb | PluginCreator<ProcessOptions>;

export default class StyleParser {
  private processor!: Processor;

  private _options!: ProcessOptions;

  source!: string;

  private async mergeOptions() {
    if (!this._options) {
      let syntax = null;
      switch (this.options?.type) {
        case FileType.Less:
          syntax = (await import('postcss-less')).default;
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
    this.source = sourceCode;
    this.processor = postcss();
  }

  async traverse(plugins: StyleVisitor[]) {
    if (t.isArray(plugins)) {
      plugins.forEach((p) => {
        const plugin = <any>p; // TODO
        if (plugin.postcss) {
          this.processor.use(plugin);
        } else {
          this.processor.use(plugin(this.ctx, this));
        }
      });
    }
    await this.processor.process(this.source, await this.mergeOptions());
  }
}
