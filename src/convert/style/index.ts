import BaseHandler from '../../core/bases/handler.js';
import type { Style } from '../../types/convert.js';

export default class StyleHandler extends BaseHandler {
  constructor(protected ctx: Style.Ctx) {
    super(ctx);
    this.extendCtx();
    this.setVisitors();
  }

  async setup() {
    await this.initCommandConfigs();
  }

  async extendCtx() {}

  async setVisitors() {}
}
