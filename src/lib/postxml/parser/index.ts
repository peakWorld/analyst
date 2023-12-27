import {
  parseTag,
  parseText,
  parseInterpolation,
  parseComment,
} from './parse.js';
import { isEnd } from './util.js';
import { TextModes } from './constant.js';
import type { Context, Element, Node, ParserOptions } from './type.js';

export function parse(str: string, options?: ParserOptions) {
  const context: Context = {
    source: str,
    mode: TextModes.DATA,
    advanceBy(size: number) {
      context.source = context.source.slice(size);
    },
    advanceSpaces() {
      const match = /^[\t\r\n\f\s]+/.exec(context.source);
      if (match) {
        context.advanceBy(match[0].length);
      }
    },
  };
  const nodes = parseChildren(context, []);
  return { type: 'Root', children: nodes };
}

function parseChildren(context: Context, ancestors: Element[]) {
  let nodes: Node[] = [];
  const { mode, source } = context;

  while (!isEnd(context, ancestors)) {
    let node;
    if (mode === TextModes.DATA || mode === TextModes.RCDATA) {
      if (mode === TextModes.DATA && source[0] === '<') {
        if (source[1] === '!') {
          if (source.startsWith('<!--')) {
            node = parseComment(context);
          } else if (source.startsWith('<![CDATA[')) {
            // node = parseCDATA(context, ancestors);
          }
        } else if (source[1] === '/') {
          console.error('无效的结束标签');
          continue;
        } else if (/[a-z]/i.test(source[1])) {
          node = parseElement(context, ancestors);
        }
      } else if (source.startsWith('{{')) {
        node = parseInterpolation(context);
      }
    }
    if (!node) {
      node = parseText(context);
    }
    nodes.push(node);
  }
  return nodes;
}

function parseElement(context: Context, ancestors: Element[]) {
  const element = parseTag(context);
  if (element.isSelfClosing) return element;

  if (element.tag === 'textarea' || element.tag === 'title') {
    context.mode = TextModes.RCDATA;
  } else if (/style|xmp|iframe|noembed|noframes|noscript/.test(element.tag)) {
    context.mode = TextModes.RAWTEXT;
  } else {
    context.mode = TextModes.DATA;
  }

  ancestors.push(element);
  element.children = parseChildren(context, ancestors);
  ancestors.pop();

  if (context.source.startsWith(`</${element.tag}`)) {
    parseTag(context, 'end'); // 结束只消耗
  } else {
    console.error(`${element.tag} 标签缺少闭合标签`);
  }
  return element;
}
