import compiler from 'vue-template-compiler';
import JsAst from '../../ast/js/index.js';
// import StyleAst from '../../ast/style/index.js';
// import HtmlAst from '../../ast/html/index.js';
import type { Context } from '../../../types/clipanion.js';

export default class Vue2Ast {
  constructor(protected ctx: Context, protected fileUrl: string) {}

  async find(text: string) {}
}
