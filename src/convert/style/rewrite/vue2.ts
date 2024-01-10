import type { Style } from '../../../types/convert.js';
import type compiler from 'vue-template-compiler';
import { saveDataToTmpJsonFile } from '../../../utils/index.js';

export default (ctx: Style.Ctx) => {
  const { parsers } = ctx;

  class Vue2 extends parsers.vue2 {
    protected async parseStyle(styles: compiler.SFCBlock[]) {
      // console.log('parseStyle', this.ctx.current.processing, styles);
      // saveDataToTmpJsonFile({ styles }, 'styles');
      return styles;
    }
  }

  parsers.vue2 = Vue2;
};
