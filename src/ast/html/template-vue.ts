import TemplateAst, { Visitor } from './index.js';
import { useRegGetImgUrl, transfromFileUrl } from '../../utils/index.js';
import { AstContext } from '../../interface.js';

export default (codestr: string, context: AstContext) => {
  return new Promise<string[]>((resolve) => {
    const imports = new Set<string>();
    const ast = new TemplateAst(codestr);
    const visitor: Visitor = {};

    async function onBeforeExit() {
      const fileUrls = transfromFileUrl(imports, context, true);
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
