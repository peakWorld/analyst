import { Command, Option } from 'clipanion';
import StyleHandler from './style/index.js';
import BaseCommand from '../core/bases/command.js';
import { CommandKey } from '../types/constant.js';
import type { StyleCtx } from '../types/convert.js';

export default class ConvertCommand extends BaseCommand<StyleCtx> {
  static paths = [[`convert`]];

  static usage = Command.Usage({
    category: `My category`,
    description: `文件转换`,
    details: `
      1、样式文件转换

      注: 在项目工作区间执行命令。
    `,
    examples: [[`分析项目`, `$0 convert -s`]],
  });

  style = Option.Boolean('-s,--style', false, {
    description: '样式文件转换',
  });

  async execute() {
    if (this.style) {
      this.setup(CommandKey.ConvertStyle);
      new StyleHandler(this.context as StyleCtx).setup(); // 执行逻辑
    }
  }
}

if (process.env.NODE_ENV === 'debug') {
  (async () => {
    const instance = new ConvertCommand();
    instance.context = {} as any;
    instance.verbose = false;
    instance.style = true;
    instance.execute();
  })();
}
