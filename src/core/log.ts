import { type BaseContext } from 'clipanion';
import { t } from '../utils/index.js';

export default class Logger {
  constructor(private ctx: BaseContext, private clsName: string) {}

  verbose = false;

  log(txt: string, extra?: unknown) {
    this.ctx.stdout.write(`${this.clsName}: ${txt}\n`);

    if (!this.verbose || t.isEmpty(extra)) return; // 不输出额外信息

    let extraText = `${this.clsName}: `;
    if (t.isObject(extra)) {
      extraText += `${JSON.stringify(extra, undefined, 2)}`;
    }
    if (t.isArray(extra)) {
      extraText += `${JSON.stringify(extra)}`;
    }
    if (t.isFunc(extra)) {
      extraText += extra.toString();
    }
    if (t.isNotEmpty(extra)) {
      extraText += extra;
    }
    this.ctx.stdout.write(`${extraText}\n`);
  }
}
