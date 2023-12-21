import fs from 'fs-extra';
import compiler from 'vue-template-compiler';
import JsParser from './js.js';
// import StyleParser from './style.js';
// import TemplateParser from './template.js';
import type { Context } from '../../../types/clipanion.js';

export default class Vue2Parser {
  jsParser!: JsParser;

  private setup() {
    const code = fs.readFileSync(this.fileUrl).toString();
    const { template, script, styles } = compiler.parseComponent(code);

    if (template.content) {
      // TODO
    }
    if (script.content) {
      this.jsParser = new JsParser(this.ctx, script.content);
    }
    if (styles.length) {
      // TODO
    }
  }

  constructor(protected ctx: Context, protected fileUrl: string) {
    this.setup();
  }
}
