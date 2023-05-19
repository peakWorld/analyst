// import path from 'path';
import compiler from 'vue-template-compiler';
import syntaxDecorators from '@babel/plugin-syntax-decorators';
import { AstContext } from '../../interface.js';
import astParsing from './parsing.js';
import lessParsing from '../style/less.js';
import templateParsing from '../html/template-vue.js';
import { LANG } from '../../consts.js';
import { transfromFileUrl } from '../../utils/index.js';

export default async (codestr: string, context: AstContext) => {
  const imports = [];
  const { template, script, styles } = compiler.parseComponent(codestr);

  // 处理模板
  if (template?.content) {
    const staticsUrl = await templateParsing(template.content, context);
    console.log('staticsUrl', staticsUrl);
  }

  // 处理ts
  if (script?.content) {
    const tsRes = await astParsing(script.content, context, [
      [syntaxDecorators, { version: '2023-01' }],
    ]);
    console.log('tsRes', tsRes);
  }

  // 处理样式
  if (styles?.length) {
    // less
    const lessContents = new Set<string>();
    const lessLinks = new Set<string>();

    styles.forEach((style) => {
      const { lang, content, src } = style;
      if (lang === LANG.Less) {
        if (content && !src) {
          lessContents.add(content);
        }
        if (src) {
          lessLinks.add(src);
        }
      }
    });

    // less 内联样式
    if (lessContents.size) {
      context.styleLang = LANG.Less;
      // const imports =
      await lessParsing(Array.from(lessContents).join('\n'), context);
      // console.log('styles rsp', imports);
      delete context.styleLang;
    }

    // less 链接样式
    if (lessLinks.size) {
      // const staticsUrl =
      transfromFileUrl(lessLinks, context);
      // console.log('staticsUrl', staticsUrl);
    }
  }
  return imports;
};
