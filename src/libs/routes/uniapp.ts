import BaseRoute from './base.js';

export default class Uniapp extends BaseRoute {
  setup() {
    this.ctx.logger.log('Uniapp ==> ');
    return this;
  }

  async getRoutes() {
    return {};
  }
}
