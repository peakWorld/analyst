import BaseHandler from '../core/bases/handler.js';
import jtsVisitor from './visitor/jts.js';
import styleVisitor from './visitor/style.js';
import vue2Visitor from './visitor/vue2.js';
import { FileType } from '../types/constant.js';
import { Ctx } from '../types/find.js';

export default class FindHandler extends BaseHandler {
  private result = new Map<string, Set<string>>();

  constructor(protected ctx: Ctx, private text: string) {
    super(ctx);
    this.expandCtxInInit();
  }

  expandCtxInInit() {
    this.ctx.addFind_Result = (k) => {
      const { current } = this.ctx;
      if (!current.path) return;

      if (!this.result.has(k)) {
        const set = new Set([current.path]);
        this.result.set(k, set);
      } else {
        const set = this.result.get(k);
        set.add(current.path);
      }
      this.ctx.restA_Current();
    };

    this.ctx.addVisitor({
      type: [FileType.Css, FileType.Less, FileType.Scss],
      handler: styleVisitor(this.text),
    });
    this.ctx.addVisitor({
      type: [FileType.Js, FileType.Ts],
      handler: jtsVisitor(this.text),
    });
    this.ctx.addVisitor({
      type: [FileType.Vue],
      handler: vue2Visitor(this.text),
    });
  }

  async setup() {
    if (!this.text) throw new Error('查询条件为空!');

    await this.initCommandConfigs();
    // await this.handleEntries();
    await this.handleRoutes();

    console.log('result', this.result);
  }
}
