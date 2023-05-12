// import path from 'path';
import compiler from 'vue-template-compiler';
import syntaxDecorators from '@babel/plugin-syntax-decorators';
import { AstProjectOptions } from '../../interface.js';
import astParsing from './parsing.js';
// import lessParsing from '../style/less.js';
import templateParsing from '../html/template-vue.js';
// import { LANG } from '../../consts.js';
import {
  // alias2AbsUrl,
  // getIntegralPath,
  getDataAndDir,
} from '../../utils/index.js';

export interface Option extends AstProjectOptions {
  fileUrl: string;
}

export default async (option: Option) => {
  const imports = [];
  const { fileUrl, ...ops } = option;
  const { dir, data: codestr } = getDataAndDir(fileUrl);

  const { template, script, styles } = compiler.parseComponent(codestr);

  // 处理模板
  if (template?.content) {
    templateParsing({ codestr: template.content, dir });
  }

  // 处理ts
  if (script?.content) {
    astParsing({ codestr: script.content, dir, ...ops }, [
      [syntaxDecorators, { version: '2023-01' }],
    ]);
  }

  // 处理样式
  if (styles?.length) {
    // styles.forEach(async (style) => {
    //   const { src, content, lang } = style;
    //   if (lang === LANG.Less) {
    //     if (src) {
    //       const styleUrl = getIntegralPath(
    //         alias2AbsUrl(src, ops.aliasMap, ops.aliasBase),
    //       );
    //       console.log('styleUrl', styleUrl);
    //     }
    //     if (content) {
    //       lessParsing({ codestr: content, dir });
    //     }
    //   }
    // });
  }

  return imports;
};
