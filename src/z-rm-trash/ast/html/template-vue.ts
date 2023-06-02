import TemplateAst, { Visitor } from './index.js';
import { Context, ParsingRsp } from '../../interface.js';
import { setAddArrItem, saveToTmpFile } from '../../../utils/index.js';

type Rsp = Omit<ParsingRsp, 'imports'>;

export default (codestr: string, context: Context) => {
  return new Promise<Rsp>((resolve) => {
    const statics = new Set<string>();

    const ast = new TemplateAst(codestr);
    const { $utils } = context;
    const visitor: Visitor = {};

    async function onBeforeExit() {
      const rsp: Rsp = { statics: [] };
      rsp.statics = Array.from(statics);
      resolve(rsp);
    }

    visitor.Img = (node) => {
      const { src, [':src']: bindSrc } = node.attrsMap;
      let urls = [];

      if (src) {
        urls.push(src);
      }
      // require('xx') | require('xx${yy}')
      if (bindSrc && /require/.test(bindSrc)) {
        urls = $utils.useRegGetRequireImgUrl(bindSrc);
      }

      urls.forEach((url) => {
        if (url.includes('http')) return;

        const rsp = $utils.transfromAliasOrRelativeUrl({ url });
        setAddArrItem(statics, rsp);
      });
    };

    visitor.Root = (node) => {
      // saveToTmpFile('template.json', node);
      // console.vlog('node', node);
      return () => {
        ast.generate();

        onBeforeExit();
      };
    };

    ast.run(visitor);
  });
};
