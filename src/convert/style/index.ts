import BaseHandler from '../../core/bases/handler.js';
import reVue2Parser from './rewrite/vue2.js';
import { FileType } from '../../types/constant.js';
import styleVisitor from './visitor/style.js';
import type { Style } from '../../types/convert.js';

export default class StyleHandler extends BaseHandler {
  constructor(protected ctx: Style.Ctx) {
    super(ctx);
    ctx.generate = true; // this.extendCtx();
    this.setVisitors();
    reVue2Parser(ctx);
  }

  async setup() {
    await this.initCommandConfigs();
    await this.expandConfig();

    this.ctx.configs.entry = [
      // '/Users/windlliu/wk/eyao.miniapp/src/packageRobot/index.vue',
      '/Users/windlliu/wk/eyao.miniapp/src/packageRobot/components/InputBar.vue',
    ];
    await this.handleEntries();
  }

  // 解析convert-style命令行专属配置
  async expandConfig() {
    if (this.commandConfigs?.convert?.style) {
      const { to } = this.commandConfigs.convert.style;
      this.ctx.toFrame = to;
    }
  }

  async setVisitors() {
    this.ctx.addVisitor({
      type: [FileType.Less],
      handler: styleVisitor,
    });
  }
}
