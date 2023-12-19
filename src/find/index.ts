import BaseHandler from '../libs/bases/handler.js';
import Vue2Ast from '../libs/ast/vue/v2.js';

export default class FindHandler extends BaseHandler {
  async setup(text: string) {
    if (!text) throw new Error('查询条件为空!');
    await super.initCommandConfigs();
    // console.log('ctx', this.ctx.configs);
    // const fileUrl = this.ctx.configs.routes._getRandom();
    const fileUrl =
      '/Users/windlliu/wk/eyao.miniapp/src/packageDrug/nearSearch/index.vue';
    console.log('fileUrl', fileUrl);
    const vu2Ast = new Vue2Ast(this.ctx, fileUrl);
    await vu2Ast.find(text);
  }
}
