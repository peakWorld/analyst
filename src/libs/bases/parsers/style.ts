import path from 'node:path';
import fs from 'fs-extra';
import { StyleType } from '../../../types/constant.js';
import { t } from '../../../utils/index.js';
import type { Context } from '../../../types/clipanion.js';

const BASE_OPTIONS: ParserOptions = {
  type: StyleType.Css,
};

export interface ParserOptions {
  type: StyleType;
}

export default class StyleParser {
  private ast!: any;

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

  parse() {
    console.log(this.sourceCode, this.options);
  }
}
