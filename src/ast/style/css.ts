import postcss from 'postcss';
import { transfromFileUrl } from '../../utils/index.js';
import { ParsingRsp, AstContext } from '../../interface.js';
import { LANG } from '../../consts.js';

export default async (codestr: string, context: AstContext) => {
  const imports = new Set<string>();
  const statics = new Set<string>();
  const rsp: ParsingRsp = { imports: [], statics: [] };

  if (/@import | url/.test(codestr)) {
    const root = postcss().process(codestr).root;

    // 文件导入
    if (/@import/.test(codestr)) {
      root.walkAtRules((rule) => {
        if (rule.name === 'import') {
          if (!rule.params) return;
          imports.add(rule.params.replace(/['"]/g, ''));
        }
      });

      if (imports.size) {
        rsp.imports = transfromFileUrl(imports, context);
      }
    }

    // 静态资源
    if (/url/.test(codestr)) {
      root.walkDecls((decl) => {
        if (decl.value.includes('url(')) {
          let url = decl.value.replace(/^url\(/, '').replace(/\)$/, '');
          // 不处理网络请求地址
          if (url.includes('http')) return;

          // less中 url地址前额外添加～
          if (context.styleLang === LANG.Less) {
            url = url.replace(/^~/, '');
          }
          statics.add(url);
        }
      });

      if (statics.size) {
        rsp.statics = transfromFileUrl(statics, context);
      }
    }
  }
  return rsp;
};
