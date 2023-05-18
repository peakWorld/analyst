/**
 * 主逻辑
 */
// import astParsing from '../ast/visitors/parsing.js';
// import lessParsing from '../ast/style/less.js';
import astParsingVue from '../ast/visitors/parsing-vue.js';
import type { MainOptions } from './interface.js';

export default class Main {
  private stack: string[] = []; // 轮训

  private cache = new Set<string>();

  constructor(private options: MainOptions) {
    const { entry } = options;
    this.stack.push(entry);
    this.cache.add(entry);

    this.loop();
  }

  private async loop() {
    // while (this.stack.length) {
    //   const fileUrl = this.stack.shift();
    //   if (this.cache.has(fileUrl)) return; // 已处理文件, 直接过滤
    // }

    // const importUrls = await astParsing({
    //   fileUrl: '/Users/windlliu/wk/tencent-pacs-frontend/src/routers/router.ts',
    //   ...this.options,
    // });

    const importUrls = await astParsingVue({
      fileUrl:
        '/Users/windlliu/wk/tencent-pacs-frontend/src/page/patient_study_module/department_pages/ultrasound_module/List.vue',
      ...this.options,
    });

    // const importUrls = await lessParsing({
    //   fileUrl:
    //     // '/Users/windlliu/wk/tencent-pacs-frontend/src/style/less/pacs/diagnose.less',
    //     '/Users/windlliu/wk/tencent-pacs-frontend/src/style/less/common.less',
    //   ...this.options,
    // });

    console.log('Main list', importUrls);
  }
}
