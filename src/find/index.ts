import BaseHandler from '../libs/bases/handler.js';
// import Vue2Parser from '../libs/bases/parsers/vue2.js';
import StyleParser from '../libs/bases/parsers/style.js';
// import jtsAst from './ast/jts.js';
import stylePlugin from './ast/style.js';
import { StyleType } from '../types/constant.js';

export default class FindHandler extends BaseHandler {
  async setup(text: string) {
    if (!text) throw new Error('查询条件为空!');
    await super.initCommandConfigs();

    // await this.handleEntries();
    // await this.handleRoutes();

    // Vue
    // const fileUrl =
    //   '/Users/windlliu/wk/eyao.miniapp/src/packageDrug/nearSearch/index.vue';
    // this.ctx.setR_Now(fileUrl);
    // const parser = new Vue2Parser(this.ctx, fileUrl);
    // parser.jsParser.traverse(jtsAst(text));

    // Style
    const fileUrl2 = '/Users/windlliu/wk/eyao.miniapp/src/uni.scss';
    const fileUrl =
      '/Users/windlliu/wk/eyao.miniapp/src/packageRobot/index.less';

    this.ctx.setR_Now(fileUrl);
    const parser = new StyleParser(this.ctx, fileUrl, { type: StyleType.Less });
    parser.traverse(stylePlugin(text));
  }

  async handleEntries() {
    const entries = this.ctx.configs.entry;
    entries.forEach(async (entry) => await this.loop(entry));
  }

  async handleRoutes() {
    const routes = this.ctx.configs.routes;
    routes.forEach(async (route) => await this.loop(route.fileUrl));
  }
}
