import path from 'node:path';
import fs from 'fs-extra';
import postcss from 'postcss';
import less from 'postcss-less';
import type { PluginCreator, Processor, ProcessOptions } from 'postcss';
import { StyleType } from '../../../types/constant.js';
import { t } from '../../../utils/index.js';
import type { Context } from '../../../types/clipanion.js';

const BASE_OPTIONS: ParserOptions = {
  type: StyleType.Css,
  from: undefined,
};

export interface ParserOptions extends ProcessOptions {
  type: StyleType;
}

export type PluginCb = (ctx: Context) => PluginCreator<ProcessOptions>;
export type Plugin = PluginCb | PluginCb[];

export default class StyleParser {
  private processor!: Processor;

  private sourceCode!: string;

  private setConfigs() {
    const base = { ...BASE_OPTIONS };
    if (this.options?.type === StyleType.Less) {
      base.syntax = less;
    }

    delete base.type;
    this.options = base;
  }

  constructor(
    protected ctx: Context,
    protected codeOrFileUrl: string,
    protected options?: ParserOptions,
  ) {
    // 判断文件
    const isFileUrl = path.isAbsolute(this.codeOrFileUrl);
    this.sourceCode = isFileUrl
      ? fs.readFileSync(this.codeOrFileUrl).toString()
      : this.codeOrFileUrl;
    this.setConfigs(); // 编译配置
    this.processor = postcss();
  }

  async traverse(plugin: Plugin) {
    if (t.isFunc(plugin)) {
      this.processor.use((<any>plugin)(this.ctx)); // TODO 类型断言
    }
    if (t.isArray(plugin)) {
      plugin.forEach((p) => this.processor.use((<any>p)(this.ctx)));
    }
    await this.processor.process(this.sourceCode, this.options);
  }
}
