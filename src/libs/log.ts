import { type BaseContext } from 'clipanion';
import { t } from '../utils/index.js';

export default class Logger {
  constructor(private ctx: BaseContext, private clsName: string) {}

  log(txt: string, extra?: unknown) {
    this.ctx.stdout.write(`${this.clsName}: ${txt}\n`);
    if (t.isObject(extra)) {
      this.ctx.stdout.write(
        `${this.clsName}: ${JSON.stringify(extra, undefined, 2)}\n`,
      );
    }
  }
}
