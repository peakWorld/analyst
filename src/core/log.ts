import { t } from '../utils/index.js';
import { isDebug } from '../utils/index.js';
import { type BaseContext } from 'clipanion';
import type { CommandKey } from '../types/constant.js';

export default class Logger {
  constructor(private ctx: BaseContext, private clsName: CommandKey) {}

  verbose = false;

  private _log(text: string) {
    if (isDebug) {
      return console.log(text);
    }
    this.ctx.stdout.write(text);
  }

  log(txt: string, extra?: unknown) {
    this._log(`${this.clsName} => ${txt}\n`);

    if (!this.verbose || t.isEmpty(extra)) return; // 不输出额外信息

    let extraText = `${this.clsName} => `;
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
    this._log(`${extraText}\n`);
  }
}
