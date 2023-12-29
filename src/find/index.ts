import BaseHandler from '../core/bases/handler.js';
import jtsAst from './ast/jts.js';
import styleAst from './ast/style.js';
import vue2Ast from './ast/vue2.js';
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

    // Vue
    // const fileUrl =
    //   '/Users/windlliu/wk/eyao.miniapp/src/packageDrug/nearSearch/index.vue';

    // Style
    // const fileUrl2 = '/Users/windlliu/wk/eyao.miniapp/src/uni.scss';
    // const fileUrl =
    //   '/Users/windlliu/wk/eyao.miniapp/src/packageRobot/index.less';
  }

  async setVisitors() {
    this.ctx.addVisitor({
      type: [FileType.Css, FileType.Less, FileType.Scss],
      handler: styleAst(this.text),
    });
    this.ctx.addVisitor({
      type: [FileType.Js, FileType.Ts],
      handler: jtsAst(this.text),
    });
    this.ctx.addVisitor({
      type: [FileType.Vue],
      handler: vue2Ast(this.text),
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
