import less from 'less';
import cssParsing from './css.js';
import { ParsingRsp, AstContext } from '../../interface.js';

export default async (codestr: string, context: AstContext) => {
  const rsp = {} as ParsingRsp;
  const renderData = await less.render(codestr, {
    paths: [context.dirUrl],
  });

  const { imports = [], css } = renderData;
  // 在less文件中通过@import方法导入的css文件, 不会被解析到imports中
  // 需要再次解析生成的css内容, 得到路径
  const cssRsp = await cssParsing(css, context);

  rsp.imports = [...imports, ...cssRsp.imports];
  rsp.statics = [...cssRsp.statics];

  return rsp;
};
