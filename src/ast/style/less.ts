import less from 'less';
import cssParsing from './css.js';
import { getDataAndDir } from '../../utils/index.js';
import { ParsingCommonOptions } from '../../interface.js';

export default async (option: ParsingCommonOptions) => {
  const { fileUrl } = option;
  let { codestr, dir } = option;
  // 文件地址存在
  if (fileUrl) {
    const { dir: dirname, data } = getDataAndDir(fileUrl);
    dir = dirname;
    codestr = data;
  }
  const { imports = [], css } = await less.render(codestr, {
    paths: [dir],
  });
  // 在less文件中通过@import方法导入的css文件, 不会被解析到imports中
  // 需要再次解析生成的css内容, 得到路径
  return [...imports, ...(await cssParsing({ codestr: css, dir }))];
};
