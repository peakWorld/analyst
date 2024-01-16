import BaseHandler from '../../core/bases/handler.js';
import { FileType } from '../../types/constant.js';
import lessVisitor from './visitor/less.js';
import scssVisitor from './visitor/scss.js';
import reParsers from './rewrite/index.js';
import type { Style } from '../../types/convert.js';

export default class StyleHandler extends BaseHandler {
  constructor(protected ctx: Style.Ctx) {
    super(ctx);
    this.expandCtxInInit();
  }

  expandCtxInInit() {
    this.ctx.shouldGen = false;

    this.ctx.addVisitor({
      type: [FileType.Less],
      handler: lessVisitor,
    });

    this.ctx.addVisitor({
      type: [FileType.Scss],
      handler: scssVisitor,
    });
  }

  async setup() {
    await this.initCommandConfigs();
    await this.expandConfig();

    this.ctx.configs.entry = [
      // '/Users/windlliu/wk/eyao.miniapp/src/packageRobot/components/InputBar.vue',
      // '/Users/windlliu/wk/eyao.miniapp/src/packageRobot/index.vue',
      '/Users/windlliu/wk/eyao.miniapp/src/packageRobot/styles/inputbar.less',
      // '/Users/windlliu/wk/eyao.miniapp/src/packageRobot/styles/inputbar.scss',
    ];
    await this.handleEntries();
  }

  async expandConfig() {
    if (!this.commandConfigs?.convert?.style)
      throw new Error('未配置转换文件类型, 来源和目标');

    const { to, from } = this.commandConfigs.convert.style;
    this.ctx.toFrame = to;

    this.ctx.needA_Gen = (type) => {
      if (!type) return false;
      if (from.includes(type)) return true;
      if (type === FileType.Vue && this.ctx.shouldGen) return true;
      return false;
    };

    this.ctx.needA_Parse = (fileUrl) => {
      return !this.ctx.appeared.has(fileUrl);
    };

    reParsers(this.ctx);
  }
}

// TODO
// 1. 正则匹配文件 处理
