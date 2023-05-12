import TemplateAst, { Visitor } from './index.js';
import { getDataAndDir, saveToTmpFile } from '../../utils/index.js';
import { ParsingCommonOptions } from '../../interface.js';

export default async (option: ParsingCommonOptions) => {
  const imports = [];
  const { fileUrl } = option;
  let { codestr, dir } = option;
  // 文件地址存在
  if (fileUrl) {
    const { dir: dirname, data } = getDataAndDir(fileUrl);
    dir = dirname;
    codestr = data;
  }

  const ast = new TemplateAst(codestr);
  const visitor: Visitor = {};

  // saveToTmpFile('html.json', ast);

  visitor.Image = (node) => {
    console.log('img.....', node.attrsMap);
  };

  visitor.exit = (node) => {
    if (ast.isElement(node) && ast.isRoot(node)) {
      console.log('node enter:', node.type, node.tag);
    }
  };

  ast.run(visitor);

  return imports;
};
