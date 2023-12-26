import path from 'node:path';
import fs from 'fs-extra';
import compiler from 'vue-template-compiler';
import JsParser from './js.js';
import StyleParser from './style.js';
// import TemplateParser from './template.js';
import { FileType } from '../../../types/constant.js';
import { getAbsHasExt } from '../../../utils/index.js';
import type { Context } from '../../../types/clipanion.js';

export default class Vue2Parser {
  jsParser!: JsParser;

  async setup() {
    const code = fs.readFileSync(this.fileUrl).toString();
    const { template, script, styles } = compiler.parseComponent(code);
    const { visitors, configs } = this.ctx;

    if (template.content) {
      // TODO
    }
    if (script.content) {
      const type = configs.frames?.ts ? FileType.Ts : FileType.Js;
      const parser = new JsParser(this.ctx, { type, code: script.content });
      visitors[type].forEach((visitor) => parser.traverse(visitor));
    }
    if (styles.length) {
      // 未声明lang的样式
      let mayType = configs.frames?.less
        ? FileType.Less
        : configs.frames?.scss
        ? FileType.Scss
        : FileType.Css;
      if (configs.frames?.less && configs.frames?.scss) {
        styles.forEach((style) => {
          if (style.lang) {
            mayType = style.lang as FileType;
          }
        });
      }
      let i = 0;
      while (i < styles.length) {
        const { lang, content, src } = styles[i];
        const type = (lang ?? mayType) as FileType.Css; // TODO 类型断言
        if (src) {
          this.ctx.addR_Pending(
            getAbsHasExt(src, path.dirname(this.ctx.current.processing)),
          );
        }
        if (content) {
          const parser = new StyleParser(this.ctx, { type, code: content });
          await parser.traverse(visitors[type]);
        }
        i++;
      }
    }
  }

  constructor(protected ctx: Context, protected fileUrl: string) {}
}
