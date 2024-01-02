import BaseHandler from '../core/bases/handler.js';
import jtsVisitor from './visitor/jts.js';
import styleVisitor from './visitor/style.js';
import vue2Visitor from './visitor/vue2.js';
import { FileType } from '../types/constant.js';

export default class FindHandler extends BaseHandler {
  private text!: string;

  async setup(text: string) {
    if (!text) throw new Error('查询条件为空!');
    this.text = text;

    await super.initCommandConfigs();
    await this.setVisitors();

    await this.handleEntries();
    // await this.handleRoutes();
  }

  async setVisitors() {
    this.ctx.addVisitor({
      type: [FileType.Css, FileType.Less, FileType.Scss],
      handler: styleVisitor(this.text),
    });
    this.ctx.addVisitor({
      type: [FileType.Js, FileType.Ts],
      handler: jtsVisitor(this.text),
    });
    this.ctx.addVisitor({
      type: [FileType.Vue],
      handler: vue2Visitor(this.text),
    });
  }

  async handleEntries() {
    const entries = [
      '/Users/windlliu/wk/eyao.miniapp/src/packageDrug/nearSearch/index.vue',
      // '/Users/windlliu/wk/eyao.miniapp/src/pages/eyao/eyao.vue',
    ];
    for (let entry of entries) {
      await this.handler(entry);
    }
  }

  async handleRoutes() {
    const { routes } = this.ctx.configs;
    for (let route of routes) {
      await this.handler(route.fileUrl);
    }
  }
}
