import fs from 'fs-extra';
import compiler from 'vue-template-compiler';
import { FileType } from '../../../types/constant.js';
import { getAbsUrlInAst, t } from '../../../utils/index.js';
import type { Context } from '../../../types/clipanion.js';
import type { Visitor, Ctx, Node } from 'vue-template-compiler';

export type Vue2Visitor =
  | Visitor
  | ((ctx: Context, parser: Vue2Parser) => Visitor);

export const NodeTypes = {
  0: 'once',
  1: 'Element',
  2: 'Expression',
  3: 'Text',
};

export default class Vue2Parser {
  private ast!: Node;

  source!: string; // 模板源代码

  contents = { template: '', script: '', styles: [] }; // generate

  private traverse(node: Node, visitor: Visitor, ctx: Ctx) {
    ctx.currentNode = node;

    const enterKey = NodeTypes[node.type];
    if (enterKey && visitor[enterKey]) {
      visitor[enterKey](node, ctx);
    }
    if (!ctx.currentNode) return;

    if (node.type === 1 || node.type === 0) {
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

  protected parseTemplate(template: string) {
    const { visitors } = this.ctx;
    this.source = template;
    this.parseDsl();
    visitors[FileType.Vue]?.forEach((visitor) => this.traverseDsl(visitor));
    return this.source;
  }

  protected parseScript(content: string) {
    const { visitors, configs, parsers, needA_Gen } = this.ctx;
    const type = configs.frames?.ts ? FileType.Ts : FileType.Js;
    const parser = new parsers.js(this.ctx, { type, code: content });
    visitors[type].forEach((visitor) => parser.traverse(visitor));
    return needA_Gen(FileType.Vue) ? parser.generateCode().code : '';
  }

  protected async parseStyle(styles: compiler.SFCBlock[]) {
    const { visitors, parsers, needA_Gen } = this.ctx;
    // 未设置lang属性的style标签, 默认为Css
    // 如果同一个文件中有些设置了lang、有些没有设置lang, 则以同文件内的lang为准
    let tmpType = FileType.Css;
    styles.forEach((style) => {
      if (style.lang && tmpType !== style.lang) {
        tmpType = style.lang as FileType;
      }
    });

    let result = [];
    for (let style of styles) {
      const { lang, content, src, scoped } = style;
      const tmpStyle = { lang, src, content, scoped };
      const type = (lang ?? tmpType) as FileType.Css; // TODO 类型断言
      if (src) {
        const urls = getAbsUrlInAst(this.ctx, src);
        urls.forEach((url) => this.ctx.addA_Pending(url));
      }
      if (content) {
        const parser = new parsers.style(this.ctx, { type, code: content });
        await parser.traverse(visitors[type]);
        if (needA_Gen(FileType.Vue)) {
          tmpStyle.content = await parser.generateCode();
        }
      }
      result.push(tmpStyle);
    }
    return result;
  }

  constructor(protected ctx: Context, protected fileUrl: string) {}

  async setup() {
    const code = fs.readFileSync(this.fileUrl).toString();
    const { template, script, styles } = compiler.parseComponent(code);

    if (styles?.length) {
      this.contents.styles = await this.parseStyle(styles);
    }
    if (script?.content) {
      this.contents.script = this.parseScript(script.content);
    }
    if (template?.content) {
      this.contents.template = this.parseTemplate(template.content);
    }
  }

  parseDsl() {
    const { ast } = compiler.compile(this.source);
    this.ast = {
      type: 0,
      children: [ast],
    } as unknown as Node;
  }

  traverseDsl(visitor: Vue2Visitor) {
    const v = t.isFunc(visitor) ? (<any>visitor)(this.ctx, this) : visitor; // TODO 类型断言
    const ctx: Ctx = {
      currentNode: null,
      childIndex: 0,
      parent: null,
    };
    this.traverse(this.ast, v, ctx);
  }

  async generateCode() {
    const { template, script, styles } = this.contents;
    let result = '';
    if (template) result += `<template>${template}</template>\n`;
    if (script) result += `<script>\n${script}\n</script>\n`;
    styles?.forEach((style) => {
      const { content, lang, src, scoped } = style;
      let text = `<style`;
      if (scoped) text += ' scoped';
      if (lang) text += ` lang='${lang}'`;
      if (src) text += ` src='${src}'`;
      text += '>';
      if (content) text += `${content}`;
      text += '</style>\n';
      result += text;
    });
    return result;
  }

  async generate() {
    const code = await this.generateCode();
    // TODO eslint格式化
    await fs.outputFile(this.ctx.current.processing, code);
  }
}
