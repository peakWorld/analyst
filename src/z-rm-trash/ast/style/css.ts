import postcss from 'postcss';
import less from 'postcss-less';
import { ParsingRsp, Context } from '../../interface.js';
import { LANG } from '../../../consts.js';
import { setAddArrItem } from '../../../utils/index.js';

export default async (codestr: string, context: Context, lang = LANG.Css) => {
  const imports = new Set<string>();
  const statics = new Set<string>();
  const { $utils } = context;
  const rsp: ParsingRsp = { imports: [], statics: [] };

  if (/@import | url/.test(codestr)) {
    const options: postcss.ProcessOptions = { from: context.currentUrl };
    if (lang === LANG.Less) {
      options.syntax = less;
    }
    const { root } = postcss().process(codestr, options);

    // 文件导入
    if (/@import/.test(codestr)) {
      root.walkAtRules((rule) => {
        if (rule.name === 'import') {
          if (!rule.params) return;
          const rsp = $utils.transfromAliasOrRelativeUrl({
            url: rule.params.replace(/['"]/g, ''),
          });
          setAddArrItem(imports, rsp);
        }
      });

      if (imports.size) {
        rsp.imports = Array.from(imports);
      }
    }

    // 静态资源
    if (/url/.test(codestr)) {
      root.walkDecls((decl) => {
        if (decl.value.includes('url(')) {
          let urls = $utils.useRegGetImgUrl(decl.value);

          // less中 url地址前额外添加～
          if (lang === LANG.Less) {
            urls = urls.map((url) => url.replace(/^~/, ''));
          }

          urls.forEach((url) => {
            const rsp = $utils.transfromAliasOrRelativeUrl({ url });
            setAddArrItem(statics, rsp);
          });
        }
      });

      if (statics.size) {
        rsp.statics = Array.from(statics);
        $utils.addStaticUrl(rsp.statics);
      }
    }

    // 将ast转成代码
    // root.toString()
  }

  return rsp;
};
