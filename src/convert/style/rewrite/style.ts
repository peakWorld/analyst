import fs from 'fs-extra';
import type { StyleCtx } from '../../../types/convert.js';

export default async (ctx: StyleCtx) => {
  const { parsers, toFrame } = ctx;

  class Style extends parsers.style {
    async generate() {
      const { processing, type } = this.ctx.current;
      const fileUrl = processing.replace(`.${type}`, `.${toFrame}`);
      const code = await this.generateCode();
      // TODO 格式化
      fs.ensureFileSync(fileUrl);
      await fs.outputFile(fileUrl, code);
      // fs.removeSync(processing)
    }
  }

  parsers.style = Style;
};
