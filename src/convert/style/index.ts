import BaseHandler from '../../core/bases/handler.js';
import { FileType } from '../../types/constant.js';
import lessVisitor from './visitor/less.js';
// import scssVisitor from './visitor/scss.js';
import reParsers from './parser/index.js';
import type { StyleCtx } from '../../types/convert.js';

export default class StyleHandler extends BaseHandler {
  constructor(protected ctx: StyleCtx) {
    super(ctx);
    this.expandCtxInInit();
  }

  expandCtxInInit() {
    this.ctx.shouldVueGen = false;
    this.ctx.rules = { mixins: new Set() };

    this.ctx.addVisitor({
      type: [FileType.Less],
      handler: lessVisitor,
    });

    // this.ctx.addVisitor({
    //   type: [FileType.Scss],
    //   handler: scssVisitor,
    // });
  }

  async setup() {
    await this.initCommandConfigs();
    await this.expandConfig();

    this.ctx.configs.entry = [
      '/Users/windlliu/wk_pre/eyao.miniapp/src/packageRobot/index.vue',
      // '/Users/windlliu/wk_pre/eyao.miniapp/src/packageRobot/index.less',
      // '/Users/windlliu/wk_pre/eyao.miniapp/src/packageRobot/styles/var/care-token.less',
      // '/Users/windlliu/wk_pre/eyao.miniapp/src/packageRobot/styles/inputbar.less',
      // '/Users/windlliu/wk_pre/eyao.miniapp/src/packageRobot/styles/var/mixins.less',
    ];
    await this.handleEntries();
    // await this.handleRoutes();
  }

  async expandConfig() {
    if (!this.commandConfigs?.convert?.style)
      throw new Error('未配置转换文件类型, 来源和目标');

    const { to, from } = this.commandConfigs.convert.style;
    this.ctx.toFrame = to;

    this.ctx.needA_Gen = (type) => {
      if (!type) return false;
      if (from.includes(type)) return true;
      if (type === FileType.Vue && this.ctx.shouldVueGen) return true;
      return false;
    };

    this.ctx.needA_Parse = (fileUrl) => {
      return !this.ctx.appeared.has(fileUrl);
    };

    reParsers(this.ctx);
  }
}
