import BaseHandler from '../libs/bases/handler.js';
// import Vue2Parser from '../libs/bases/parsers/vue2.js';
import StyleParser from '../libs/bases/parsers/style.js';
// import jtsAst from './ast/jts.js';

export default class FindHandler extends BaseHandler {
  async setup(text: string) {
    if (!text) throw new Error('查询条件为空!');
    await super.initCommandConfigs();

    // Vue
    // console.log('ctx', this.ctx.configs);
    // const fileUrl = this.ctx.configs.routes._getRandom();
    // const fileUrl =
    //   '/Users/windlliu/wk/eyao.miniapp/src/packageDrug/nearSearch/index.vue';
    // console.log('fileUrl', fileUrl);
    // const parser = new Vue2Parser(this.ctx, fileUrl);
    // parser.jsParser.traverse(jtsAst(text));

    // Style
    const fileUrl = '/Users/windlliu/wk/eyao.miniapp/src/uni.scss';
    const fileUrl2 =
      '/Users/windlliu/wk/eyao.miniapp/src/packageRobot/index.less';
    new StyleParser(this.ctx, fileUrl);
  }
}
