import fs from 'fs-extra';
import type { StyleCtx } from '../../../types/convert.js';

export default async (ctx: StyleCtx) => {
  const { parsers, toFrame } = ctx;

  class Style extends parsers.style {
    async generate() {
      const { processing, type } = this.ctx.current;
      const fileUrl = processing.replace(`.${type}`, `.${toFrame}`);
      const code = await this.generateCode();
      fs.ensureFileSync(fileUrl);
      fs.outputFileSync(fileUrl, code);
      await this.stylintCodeByCommand(fileUrl);
    }
  }

  parsers.style = Style;
};
