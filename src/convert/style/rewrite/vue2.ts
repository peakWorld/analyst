import { getAbsUrlInAst } from '../../../utils/index.js';
import { FileType } from '../../../types/constant.js';
import type { Style } from '../../../types/convert.js';
import type compiler from 'vue-template-compiler';

export default async (ctx: Style.Ctx) => {
  const { parsers, toFrame, visitors } = ctx;

  class Vue2 extends parsers.vue2 {
    protected async parseStyle(styles: compiler.SFCBlock[]) {
      const result = [];
      for (let style of styles) {
        const { content, lang, src, scoped } = style;
        const tmpStyle = { lang, scoped, src, content };

        if (!lang || lang === FileType.Css) {
          result.push(tmpStyle);
          continue;
        }

        if (lang !== toFrame) ctx.shouldGen = true;

        if (src) {
          const urls = getAbsUrlInAst(ctx, src);
          urls.forEach((url) => ctx.addA_Pending(url));
          if (lang != toFrame) {
            tmpStyle.lang = toFrame;
            tmpStyle.src = src.replace(`.${lang}`, `.${toFrame}`);
          }
        }
        if (content) {
          const parser = new parsers.style(ctx, {
            type: lang as FileType,
            code: content,
          });
          await parser.traverse(visitors[lang]);
          if (lang != toFrame) {
            tmpStyle.lang = toFrame;
            tmpStyle.content = await parser.generateCode();
          }
        }
        result.push(tmpStyle);
      }
      // saveDataToTmpJsonFile({ styles }, 'styles');
      return result;
    }

    async generate() {
      super.generate();
      ctx.shouldGen = false;
    }
  }

  parsers.vue2 = Vue2;
};
