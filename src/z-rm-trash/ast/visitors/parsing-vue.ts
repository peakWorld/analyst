import compiler from 'vue-template-compiler';
// import syntaxDecorators from '@babel/plugin-syntax-decorators';
import { Context, DyParsingRsp } from '../../interface.js';
import astParsing from './parsing.js';
import cssParsing from '../style/css.js';
import templateParsing from '../html/template-vue.js';
import { LANG } from '../../../consts.js';

export default async (codestr: string, context: Context) => {
  const rsp: DyParsingRsp = { imports: [], statics: [], dyImports: [] };
  const { $utils } = context;
  const { template, script, styles } = compiler.parseComponent(codestr);

  // 处理模板
  if (template?.content) {
    const staticsUrl = await templateParsing(template.content, context);
    rsp.statics = staticsUrl;
  }

  // 处理ts
  if (script?.content) {
    const { imports, statics, dyImports } = await astParsing(
      script.content,
      context,
    );
    rsp.imports = imports;
    rsp.dyImports = dyImports;
    rsp.statics = [...rsp.statics, ...statics];
    $utils.addDynamicsUrl(dyImports);
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
      const { imports, statics } = await cssParsing(
        Array.from(lessContents).join('\n'),
        context,
        LANG.Less,
      );
      rsp.imports = [...rsp.imports, ...imports];
      rsp.statics = [...rsp.statics, ...statics];
    }

    // less 链接样式
    if (lessLinks.size) {
      const imports = $utils.transfromFileUrl(context, lessLinks);
      rsp.imports = [...rsp.imports, ...imports];
    }

    $utils.addStaticUrl(rsp.statics);
  }
  return rsp;
};
