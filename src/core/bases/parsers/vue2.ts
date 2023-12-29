import path from 'node:path';
import fs from 'fs-extra';
import compiler from 'vue-template-compiler';
import JsParser from './js.js';
import StyleParser from './style.js';
import { FileType } from '../../../types/constant.js';
import {
  getAbsHasExt,
  t,
  saveDataToTmpJsonFile,
} from '../../../utils/index.js';
import type { Context } from '../../../types/clipanion.js';
import type { Visitor, Ctx, Node } from 'vue-template-compiler';

export type Vue2Visitor = Visitor | ((ctx: Context) => Visitor);

export const NodeTypes = {
  0: 'once',
  1: 'Element',
  2: 'Expression',
  3: 'Text',
};

export default class Vue2Parser {
  private ast!: Node;

  private traverse(node: Node, visitor: Visitor, ctx: Ctx) {
    ctx.currentNode = node;

    const enterKey = NodeTypes[node.type];
    if (enterKey && visitor[enterKey]) {
      visitor[enterKey](node, ctx);
    }
    if (!ctx.currentNode) return;

    if (node.type === 1) {
      const children = node.children;
      if (children.length) {
        for (let i = 0; i < children.length; i++) {
          ctx.parent = ctx.currentNode;
          ctx.childIndex = i;
          this.traverse(children[i], visitor, ctx);
        }
      }
    }
    if (enterKey) {
      const exitKey = `${enterKey}Exit`;
      if (visitor[exitKey]) {
        visitor[exitKey](node, ctx);
      }
    }
  }

  constructor(protected ctx: Context, protected fileUrl: string) {}

  async setup() {
    const code = fs.readFileSync(this.fileUrl).toString();
    const { template, script, styles } = compiler.parseComponent(code);
    const { visitors, configs } = this.ctx;

    if (template.content) {
      this.parseDsl(template.content);
      visitors[FileType.Vue]?.forEach((visitor) => this.traverseDsl(visitor));
    }
    if (script.content) {
      const type = configs.frames?.ts ? FileType.Ts : FileType.Js;
      const parser = new JsParser(this.ctx, { type, code: script.content });
      visitors[type].forEach((visitor) => parser.traverse(visitor));
    }
    if (styles.length) {
      // 未设置lang属性的style标签, 默认为Css
      // 如果同一个文件中有些设置了lang、有些没有设置lang, 则以同文件内的lang为准
      let tmpType = FileType.Css;
      styles.forEach((style) => {
        if (style.lang && tmpType !== style.lang) {
          tmpType = style.lang as FileType;
        }
      });

      for (let style of styles) {
        const { lang, content, src } = style;
        const type = (lang ?? tmpType) as FileType.Css; // TODO 类型断言
        if (src) {
          this.ctx.addR_Pending(
            getAbsHasExt(src, path.dirname(this.ctx.current.processing)),
          );
        }
        if (content) {
          const parser = new StyleParser(this.ctx, { type, code: content });
          await parser.traverse(visitors[type]);
        }
      }
    }
  }

  parseDsl(code: string) {
    saveDataToTmpJsonFile({ code }, '2');
    const { ast } = compiler.compile(code);
    this.ast = {
      type: 0,
      children: [ast],
    } as unknown as Node;
  }

  traverseDsl(visitor: Vue2Visitor) {
    const v = t.isFunc(visitor) ? (<any>visitor)(this.ctx) : visitor; // TODO 类型断言
    const ctx: Ctx = {
      currentNode: null,
      childIndex: 0,
      parent: null,
    };
    this.traverse(this.ast, v, ctx);
  }
}
