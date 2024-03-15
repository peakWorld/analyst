import Vue2Parser from '../../core/bases/parsers/vue2.js';
import StyleParser from '../../core/bases/parsers/style.js';
import JsParser from '../../core/bases/parsers/js.js';
import { setRoute, getExt } from '../../utils/index.js';
import jstBaseVisitor from './visitors/jts.js';
import styleBaseVisitor from './visitors/style.js';
import vue2BaseVisitor from './visitors/vue2.js';
import { FileType } from '../../types/constant.js';
import type { Context } from '../../types/clipanion.js';
import type { ResolvedVisitor } from '../../types/libs.js';
import type BaseHandler from './handler.js';

export const expand = (target: { new (...args: any[]): BaseHandler }) => {
  return class extends target {
    private expandBaseCtxInInit() {
      this.ctx.appeared = new Set();
      this.ctx.current = {
        processing: '',
        path: '',
        pending: [],
        handled: new Set(),
        type: undefined,
      };
      this.ctx.visitors = {} as ResolvedVisitor;

      this.base();
      this.visitor();
      this.initParsers();
    }

    // 这些Ctx方法, 在循环逻辑中使用 A => After
    private base() {
      this.ctx.setA_Current = (fileUrl, path) => {
        this.ctx.appeared.add(fileUrl);
        this.ctx.current.handled.add(fileUrl);
        this.ctx.current.processing = fileUrl;
        this.ctx.current.type = getExt(fileUrl);
        this.ctx.current.path = path;
        return this.ctx.current;
      };
      this.ctx.addA_Pending = (fileUrl) => {
        const { pending } = this.ctx.current;
        if (pending.includes(fileUrl)) return;
        this.ctx.current.pending.push(fileUrl);
      };
      this.ctx.restA_Current = () => {
        this.ctx.current.handled.clear();
        this.ctx.current.pending.length = 0;
        this.ctx.current.path = '';
        this.ctx.current.processing = '';
      };
      this.ctx.addA_Route = (
        fileUrl: string,
        path?: string,
        extra?: AnyObj,
      ) => {
        const route = setRoute(fileUrl, path, extra);
        this.ctx.configs.routes.push(route);
      };
      this.ctx.needA_Gen = () => false;
      this.ctx.needA_Parse = () => true;
    }

    private initParsers() {
      this.ctx.parsers = {
        vue2: Vue2Parser,
        style: StyleParser,
        js: JsParser,
      };
    }

    private visitor() {
      this.ctx.addVisitor = (visitor) => {
        const { type, handler } = visitor;
        type.forEach((v) => {
          if (!this.ctx.visitors[v]) {
            this.ctx.visitors[v] = [];
          }
          if (!this.ctx.visitors[v].includes(handler)) {
            this.ctx.visitors[v].push(handler);
          }
        });
      };
      this.ctx.addVisitor({
        type: [FileType.Css, FileType.Less, FileType.Scss],
        handler: styleBaseVisitor,
      });
      this.ctx.addVisitor({
        type: [FileType.Js, FileType.Ts],
        handler: jstBaseVisitor,
      });
    }

    // 必须等configs解析完成后, 按照配置更新Ctx
    private expandCtxAfterLoadedConfigs() {
      if (this.ctx.configs.frames.vue2) {
        this.ctx.addVisitor({
          type: [FileType.Vue],
          handler: vue2BaseVisitor,
        });
      }
    }

    protected async initCommandConfigs() {
      await super.initCommandConfigs();
      this.expandCtxAfterLoadedConfigs();
    }

    constructor(ctx: Context) {
      super(ctx);
      this.expandBaseCtxInInit();
    }
  };
};
