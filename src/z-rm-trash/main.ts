/**
 * 主逻辑
 */
// import astParsing from '../ast/visitors/parsing.js';
// import lessParsing from '../ast/style/less.js';
import astParsingVue from '../ast/visitors/parsing-vue.js';
import type { MainOptions } from './interface.js';

export default class Main {
  // private fileUrls = [];

  constructor(private options: MainOptions) {
    this.parse();
  }

  private async parse() {
    // const importUrls = await astParsing({
    //   fileUrl: this.options.entry,
    //   ...this.options,
    // });

    const importUrls = await astParsingVue({
      fileUrl: '/Users/windlliu/wk/CallTool-FE/src/views/workSpace/index.vue',
      ...this.options,
    });

    // const importUrls = await astParsingVue({
    //   fileUrl:
    //     '/Users/windlliu/wk/tencent-pacs-frontend/src/components/ui/toast/index.vue',
    //   ...this.options,
    // });

    console.log('list', importUrls);
  }
}
