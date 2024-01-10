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

  source!: string;

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

  async mergeOptions() {
    const options = { ...BASE_OPTIONS };
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
    if (syntax) {
      options.syntax = syntax;
    }
    if (!this.source && this.ctx.current.processing) {
      options.from = this.ctx.current.processing;
    }
    return options;
  }

  async traverse(plugins: StyleVisitor[]) {
    const options = await this.mergeOptions();

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
    await this.processor.process(this.source, options);
  }

  async generateCode() {
    return '';
  }
}
