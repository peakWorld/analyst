import BaseHandler from '../libs/bases/handler.js';
import jtsAst from './ast/jts.js';
import stylePlugin from './ast/style.js';
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
      handler: stylePlugin(this.text),
    });
    this.ctx.addVisitor({
      type: [FileType.Js, FileType.Ts],
      handler: jtsAst(this.text),
    });
  }

  async handleEntries() {
    // const entries = this.ctx.configs.entry;
    const entries = [
      '/Users/windlliu/wk/eyao.miniapp/src/packageDrug/nearSearch/index.vue',
    ];
    while (entries.length) {
      await this.handler(entries.shift());
    }
  }

  async handleRoutes() {
    const { routes } = this.ctx.configs;
    while (routes.length) {
      const { fileUrl } = routes.shift();
      await this.handler(fileUrl);
    }
  }
}
