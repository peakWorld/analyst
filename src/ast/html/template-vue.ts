import TemplateAst, { Visitor } from './index.js';
import {
  getDataAndDir,
  useRegGetImgUrl,
  transfromFileUrl,
  // saveToTmpFile,
} from '../../utils/index.js';
import { AstProjectOptions, ParsingCommonOptions } from '../../interface.js';

export interface Option extends AstProjectOptions, ParsingCommonOptions {}

export default (options: Option) => {
  return new Promise<string[]>((resolve) => {
    const { fileUrl } = options;
    let { codestr, dir } = options;
    // 文件地址存在
    if (fileUrl) {
      const { dir: dirname, data } = getDataAndDir(fileUrl);
      dir = dirname;
      codestr = data;
    }

    const imports = new Set<string>();
    const ast = new TemplateAst(codestr);
    const visitor: Visitor = {};

    // saveToTmpFile('html.json', ast);

    async function onBeforeExit() {
      const fileUrls = transfromFileUrl(
        { fileUrls: imports, dir, options },
        true,
      );
      resolve(fileUrls);
    }

    visitor.Image = (node) => {
      const { src, [':src']: bindSrc } = node.attrsMap;
      if (src) {
        imports.add(src);
      }
      if (bindSrc && /require/.test(bindSrc)) {
        const tmpUrls = useRegGetImgUrl(bindSrc);
        tmpUrls.forEach((it) => imports.add(it));
      }
    };

    visitor.exit = (node) => {
      if (ast.isElement(node) && ast.isRoot(node)) {
        onBeforeExit();
      }
    };

    ast.run(visitor);
  });
};
