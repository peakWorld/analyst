import postcss from 'postcss';
import path from 'path';
import { getDataAndDir } from '../../utils/index.js';
import { ParsingCommonOptions } from '../../interface.js';
// import { saveToTmpFile } from '../../utils/index.js';

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
  if (/@import/.test(codestr)) {
    const root = postcss().process(codestr).root;
    root.walkAtRules('import', (rule) => {
      if (!rule.params) return;
      imports.push(path.join(dir, rule.params.replace(/['"]/g, '')));
    });
  }
  return imports;
};
