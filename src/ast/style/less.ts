import less from 'less';
import cssParsing from './css.js';
import { getDataAndDir } from '../../utils/index.js';
import {
  AstProjectOptions,
  ParsingCommonOptions,
  ParsingRsp,
} from '../../interface.js';
import { LANG } from '../../consts.js';

export interface Option extends AstProjectOptions, ParsingCommonOptions {}

export default async (option: Option) => {
  const rsp = {} as ParsingRsp;
  const { fileUrl, ...ops } = option;
  let { codestr, dir } = option;
  // 文件地址存在
  if (fileUrl) {
    const { dir: dirname, data } = getDataAndDir(fileUrl);
    dir = dirname;
    codestr = data;
  }
  const renderData = await less.render(codestr, {
    paths: [dir],
  });

  const { imports = [], css } = renderData;
  // 在less文件中通过@import方法导入的css文件, 不会被解析到imports中
  // 需要再次解析生成的css内容, 得到路径
  const cssRsp = await cssParsing({
    ...ops,
    codestr: css,
    dir,
    type: LANG.Less,
  });

  rsp.imports = [...imports, ...cssRsp.imports];
  rsp.statics = [...cssRsp.statics];

  return rsp;
};
