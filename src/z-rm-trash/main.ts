/**
 * 主逻辑
 */
import astParsing from '../ast/visitors/parsing.js';
// import lessParsing from '../ast/style/less.js';
// import astParsingVue from '../ast/visitors/parsing-vue.js';
import { getDataAndDir } from '../utils/index.js';
import { LANG } from '../consts.js';
import type { MainOptions } from './interface.js';
import type { AstContext } from '../interface.js';

export default class Main {
  private stack: string[] = []; // 轮询

  private context!: AstContext;

  constructor(options: MainOptions) {
    this.stack.push(options.entry);

    this.context = this.createContext(options);
    this.loop();
  }

  private createContext(options: MainOptions) {
    const context = {} as AstContext;

    context.parsed = new Set<string>();
    context.statics = new Set<string>();

    context.deps = options.deps;
    context.aliasMap = options.aliasMap;
    context.alias = options.alias;
    context.aliasBase = options.aliasBase;

    context.currentUrl = '';
    context.dirUrl = '';

    return context;
  }

  private async loop() {
    const { context } = this;
    // while (this.stack.length) {
    //   const fileUrl = this.stack.shift();
    //   if (context.parsed.has(fileUrl)) return; // 已处理文件, 直接过滤
    // }

    // const fileUrl =
    //   '/Users/windlliu/wk/tencent-pacs-frontend/src/page/patient_study_module/department_pages/ultrasound_module/List.vue';
    const fileUrl = '/Users/windlliu/wk/tencent-pacs-frontend/src/main.ts';
    const [codestr, dirUrl, ext] = getDataAndDir(fileUrl);
    context.currentUrl = fileUrl;
    context.dirUrl = dirUrl;

    const importUrls = await astParsing(codestr, context);

    // const importUrls = await astParsingVue(codestr, context);

    // 样式 less
    context.styleLang = LANG.Less;
    // const importUrls = await lessParsing({
    //   fileUrl:
    //     // '/Users/windlliu/wk/tencent-pacs-frontend/src/style/less/pacs/diagnose.less',
    //     '/Users/windlliu/wk/tencent-pacs-frontend/src/style/less/common.less',
    //   ...this.options,
    // });
    delete context.styleLang;

    console.log('Main list', importUrls, ext);
  }
}
