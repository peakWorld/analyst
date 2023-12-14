import BaseHandler from '../libs/bases/handler.js';

// type Constructor<T = {}> = new (...args: any[]) => T;
// function mixin<TBase extends Constructor>(Base: TBase) {}

export default class FindHandler extends BaseHandler {
  private texts = [];

  async setup(text: string) {
    if (!text) throw new Error('查询条件为空!');
    await super.initCommandConfigs();
    console.log('ctx', this.ctx.configs);
  }
}
