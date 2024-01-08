import BaseHandler from '../../core/bases/handler.js';
import type { Ctx } from './interface.js';

export default class StyleHandler extends BaseHandler {
  constructor(protected ctx: Ctx) {
    super(ctx);
    this.extendCtx();
    this.setVisitors();
  }

  setup() {
    return this;
  }

  async extendCtx() {}

  async setVisitors() {}
}
