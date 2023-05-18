// import path from 'path';
import compiler from 'vue-template-compiler';
import syntaxDecorators from '@babel/plugin-syntax-decorators';
import { AstProjectOptions } from '../../interface.js';
import astParsing from './parsing.js';
import lessParsing from '../style/less.js';
import templateParsing from '../html/template-vue.js';
import { LANG } from '../../consts.js';
import { getDataAndDir, transfromFileUrl } from '../../utils/index.js';

export interface Option extends AstProjectOptions {
  fileUrl: string;
}

export default async (options: Option) => {
  const imports = [];
  const { fileUrl, ...ops } = options;
  const { dir, data: codestr } = getDataAndDir(fileUrl);

  const { template, script, styles } = compiler.parseComponent(codestr);

  // 处理模板
  if (template?.content) {
    // const staticsUrl =
    await templateParsing({
      ...ops,
      codestr: template.content,
      dir,
    });
    // console.log('staticsUrl', staticsUrl);
  }

  // 处理ts
  if (script?.content) {
    // const tsRes =
    await astParsing({ ...ops, codestr: script.content, dir }, [
      [syntaxDecorators, { version: '2023-01' }],
    ]);
    // console.log('tsRes', tsRes);
  }

  // 处理样式
  if (styles?.length) {
    // 内联样式
    const lessContents = new Set<string>();
    const lessLinks = new Set<string>();

    styles.forEach((style) => {
      const { lang, content, src } = style;
      if (lang === LANG.Less) {
        console.log(style);
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
      const imports = await Promise.all(
        Array.from(lessContents).map((codestr) =>
          lessParsing({ ...ops, codestr, dir }),
        ),
      );
      // const rsp =
      imports.flat();
      // console.log('styles rsp', rsp);
    }

    // less 链接样式
    if (lessLinks.size) {
      // const staticsUrl =
      transfromFileUrl({
        fileUrls: lessLinks,
        dir,
        options,
      });
      // console.log('staticsUrl', staticsUrl);
    }
  }
  return imports;
};
