/**
 * 主逻辑
 */
import astParsing from './ast/visitors/parsing.js';
import cssParsing from './ast/style/css.js';
import astParsingVue from './ast/visitors/parsing-vue.js';
import { getDataAndDir, isDts } from '../utils/index.js';
import { LANG } from '../consts.js';
import ContextUtils from './context.js';
import type { MainOptions, Context } from './interface.js';

const tmpUrl =
  '/Users/windlliu/wk/tencent-pacs-frontend/src/page/workLoad/particulars/consultation.vue';
// const tmpUrl = undefined;

export default class Main {
  private stack: string[] = []; // 首屏轮询

  private dyStack: string[] = []; // 动态加载资源

  private context!: Context;

  constructor(options: MainOptions) {
    this.stack.push(tmpUrl ?? options.entry);
    this.context = this.createContext(options);

    this.setUp();
  }

  private clearContext() {
    // 重置context中的动态属性
    const { context } = this;
    context.currentUrl = '';
    context.dirUrl = '';
    delete context.lang;
  }

  private async setUp() {
    // 首页资源
    console.vlog('begin: 首屏资源处理');
    await this.loopFirst();
    this.clearContext();
    console.vlog('end: 首屏资源处理');

    // 动态加载资源
    if (this.context.dynamics.size) {
      console.vlog('begin: 动态资源处理');
      await this.loopDynamic();
      this.clearContext();
      console.vlog('end: 动态资源处理');
    }

    console.log('parsed', this.context);
  }

  private createContext(options: MainOptions) {
    const context = {} as Context;

    context.parsed = new Set<string>();
    context.statics = new Set<string>(); // 图片、字体文件
    context.dynamics = new Set<string>();
    context.dts = new Set<string>();

    context.deps = options.deps;
    context.aliasMap = options.aliasMap;
    context.alias = options.alias;
    context.aliasBase = options.aliasBase;
    context.include = options.include;

    context.currentUrl = '';
    context.dirUrl = '';

    context.$utils = new ContextUtils(context);

    return context;
  }

  async loopFirst() {
    while (this.stack.length) {
      const fileUrl = this.stack.shift();
      const imports = await this.handleFile(fileUrl);
      if (imports === null) {
        continue;
      }
    }
  }

  async loopDynamic() {
    // 动态加载的资源中, 也可能存在动态加载的资源
    while (this.dyStack.length || this.stack.length) {
      const fileUrl = this.dyStack.length
        ? this.dyStack.shift()
        : this.stack.shift();
      const imports = await this.handleFile(fileUrl);
      if (imports === null) {
        continue;
      }
    }
  }

  private async handleFile(fileUrl: string) {
    const { context } = this;
    const { parsed, dts, include } = context;
    console.log('fileUrl', fileUrl);

    if (isDts(fileUrl)) {
      dts.add(fileUrl);
      return null;
    }

    // 文件已被处理过 | 文件 不在可处理区域中
    if (parsed.has(fileUrl) || include.every((it) => !fileUrl.startsWith(it))) {
      return null;
    }
    parsed.add(fileUrl);

    const [codestr, dirUrl, lang] = getDataAndDir(fileUrl);
    context.currentUrl = fileUrl;
    context.dirUrl = dirUrl;
    context.lang = lang;

    let imports = [];
    let dyImports = [];

    if ([LANG.Ts, LANG.Js].includes(lang)) {
      const rsp = await astParsing(codestr, context);
      imports = rsp.imports;
      dyImports = rsp.dyImports;
    }
    if (lang === LANG.Vue) {
      const rsp = await astParsingVue(codestr, context);
      imports = rsp.imports;
      dyImports = rsp.dyImports;
    }
    if ([LANG.Css, LANG.Less, LANG.Scss].includes(lang)) {
      const rsp = await cssParsing(codestr, context, lang);
      imports = rsp.imports;
    }

    // if (imports.some((it) => it === undefined)) {
    //   console.log('fileUrl', fileUrl);
    // }

    if (dyImports.length) {
      this.dyStack = [...new Set([...this.dyStack, ...dyImports])];
    }
    this.stack = [...new Set([...this.stack, ...imports])];
  }
}
