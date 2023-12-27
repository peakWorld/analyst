import { decodeHtml } from './util.js';
import type { Context, Element } from './type.js';

// <x> </x> <x /> 开始、结束、自闭合
export function parseTag(context: Context, type = 'start') {
  const { advanceBy, advanceSpaces } = context;

  const match =
    type == 'start'
      ? /^<([a-z][^\t\r\n\f\s]*)/i.exec(context.source)
      : /^<\/([a-z][^\t\r\n\f\s]*)/i.exec(context.source);

  const tag = match[1];
  advanceBy(match[0].length);
  advanceSpaces();

  // 已经消费了标签的开始部分 与 无用空白字符
  // 解析属性与指令, 得到props数组
  const props = type == 'start' ? parseAttributes(context) : [];

  const isSelfClosing = context.source.startsWith('/>');
  advanceBy(isSelfClosing ? 2 : 1);

  return {
    type: 'Element',
    tag,
    props,
    children: [],
    isSelfClosing,
  } as Element;
}

function parseAttributes(context: Context) {
  const { advanceBy, advanceSpaces } = context;
  const props = []; // 存储解析过程中产生的属性节点和指令节点

  // 消费模板内容, 直至遇到标签的 “结束部分” 为至
  while (!context.source.startsWith('>') && !context.source.startsWith('/>')) {
    const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source); // 匹配属性名称
    const name = match[0]; // 得到属性名称
    advanceBy(name.length); // 消费属性名称
    advanceSpaces(); // 消费属性名称与等号之间的空白字符
    advanceBy(1); // 消费等号
    advanceSpaces(); // 消费等号与属性值之间的空白字符

    let value = ''; // 属性值
    const quote = context.source[0]; // 当前模板内容的第一个字符
    const isQuote = quote === "'" || quote === '"'; // 判断属性值是否被引号引用

    if (isQuote) {
      advanceBy(1); // 消费引号
      const endQuoteIndex = context.source.indexOf(quote); // 获取下一个引号的索引
      if (endQuoteIndex > -1) {
        value = context.source.slice(0, endQuoteIndex); // 下一个引号前的内容都为属性值
        advanceBy(value.length);
        advanceBy(1); // 消费引号
      } else {
        console.error('缺少引号');
      }
    } else {
      const match = /^[^\t\r\n\f >]+/.exec(context.source); // 下一个空白符前的内容当作属性值
      value = match[0];
      advanceBy(value.length);
    }
    advanceSpaces(); // 消费属性值后的空白字符
    props.push({ type: 'Attribute', name, value });
  }
  return props;
}

// parseChildren-parseText
export function parseText(context: Context) {
  // 文本内容的结尾索引(默认将整个模板剩余内容都作为文本内容)
  let endIndex = context.source.length;
  // 寻找字符<的位置索引
  const ltIndex = context.source.indexOf('<');
  // 寻找定界符{{的位置索引
  const delimiterIndex = context.source.indexOf('{{');

  // 取小值作为新的结尾索引
  if (ltIndex > -1 && ltIndex < endIndex) {
    endIndex = ltIndex;
  }
  if (delimiterIndex > -1 && delimiterIndex < endIndex) {
    endIndex = delimiterIndex;
  }
  // 截取文本内容
  const content = context.source.slice(0, endIndex);
  // 消耗文本内容
  context.advanceBy(content.length);

  return { type: 'Text', content: decodeHtml(content) };
}

// 解析定界符
export function parseInterpolation(context: Context) {
  context.advanceBy('{{'.length); // 消费开始定界符
  // 找到结束定界符的位置索引
  const closeIndex = context.source.indexOf('}}');
  if (closeIndex < 0) {
    console.error('插值缺少结束定界符');
  }
  // 截取开始定界符与结束定界符之间的内容作为插值表达式
  const content = context.source.slice(0, closeIndex);
  context.advanceBy(content.length); // 消费表达式的内容
  context.advanceBy('{{'.length); // 消费结束定界符

  return {
    type: 'Interpolation',
    content: {
      type: 'Expression',
      content: decodeHtml(content),
    },
  };
}

// 解析注释
export function parseComment(context: Context) {
  context.advanceBy('<!--'.length); // 消费注释的开始部分
  const closeIndex = context.source.indexOf('-->'); // 结束位置
  const content = context.source.slice(0, closeIndex);
  context.advanceBy(content.length); // 消费内容
  context.advanceBy('-->'.length); // 消费结束部分

  return {
    type: 'Comment',
    content,
  };
}
