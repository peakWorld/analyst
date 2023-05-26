import TemplateAst, { Visitor } from './index.js';
import { Context } from '../../interface.js';

export default (codestr: string, context: Context) => {
  return new Promise<string[]>((resolve) => {
    const imports = new Set<string>();
    const ast = new TemplateAst(codestr);
    const { $utils } = context;
    const visitor: Visitor = {};

    async function onBeforeExit() {
      const fileUrls = $utils.transfromFileUrl(context, imports, true);
      resolve(fileUrls);
    }

    visitor.Image = (node) => {
      const { src, [':src']: bindSrc } = node.attrsMap;
      if (src) {
        imports.add(src);
      }
      if (bindSrc && /require/.test(bindSrc)) {
        const tmpUrls = $utils.useRegGetImgUrl(bindSrc);
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
