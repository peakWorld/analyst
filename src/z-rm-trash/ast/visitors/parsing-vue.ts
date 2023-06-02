import compiler from 'vue-template-compiler';
// import syntaxDecorators from '@babel/plugin-syntax-decorators';
import { Context, DyParsingRsp } from '../../interface.js';
import astParsing from './parsing.js';
import cssParsing from '../style/css.js';
import templateParsing from '../html/template-vue.js';
import { LANG } from '../../../consts.js';
import { setAddArrItem } from '../../../utils/index.js';

export default async (codestr: string, context: Context) => {
  const rsp: DyParsingRsp = { imports: [], statics: [], dyImports: [] };
  const { $utils } = context;
  const { template, script, styles } = compiler.parseComponent(codestr);

  // 处理模板
  if (template?.content) {
    const { statics } = await templateParsing(template.content, context);
    rsp.statics = statics;
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
    const links = new Set<string>();

    styles.forEach((style) => {
      const { lang, content, src } = style;
      if (lang === LANG.Less) {
        if (content && !src) {
          lessContents.add(content);
        }
        if (src) {
          links.add(src);
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

    // url方式
    if (links.size) {
      const imports = new Set<string>();
      links.forEach((url) => {
        const rsp = $utils.transfromAliasOrRelativeUrl({ url });
        setAddArrItem(imports, rsp);
      });
      rsp.imports = [...rsp.imports, ...Array.from(imports)];
    }

    $utils.addStaticUrl(rsp.statics);
  }

  return rsp;
};
