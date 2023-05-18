import postcss from 'postcss';
import { getDataAndDir, transfromFileUrl } from '../../utils/index.js';
import {
  AstProjectOptions,
  ParsingCommonOptions,
  ParsingRsp,
} from '../../interface.js';
import { LANG } from '../../consts.js';

interface Options extends AstProjectOptions, ParsingCommonOptions {
  type: LANG;
}

export default async (options: Options) => {
  const imports = new Set<string>();
  const statics = new Set<string>();

  const rsp: ParsingRsp = { imports: [], statics: [] };
  const { fileUrl, type } = options;
  let { codestr, dir } = options;
  // 文件地址存在
  if (fileUrl) {
    const { dir: dirname, data } = getDataAndDir(fileUrl);
    dir = dirname;
    codestr = data;
  }
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
        rsp.imports = transfromFileUrl({ fileUrls: imports, dir, options });
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
          if (type === LANG.Less) {
            url = url.replace(/^~/, '');
          }
          statics.add(url);
        }
      });

      if (statics.size) {
        rsp.statics = transfromFileUrl({ fileUrls: statics, dir, options });
      }
    }
  }
  return rsp;
};
