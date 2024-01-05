import { Command, Option } from 'clipanion';
// import Analyze from './analyze/index.js';
// import Logger from '../core/log.js';
import type { Context } from '../types/clipanion.js';

export default class TrashCommand extends Command<Context> {
  static paths = [[`trash`]];

  static usage = Command.Usage({
    category: `My category`,
    description: `项目处理`,
    details: `
      1、分析项目
      2、删除无用文件
      3、迁移项目文件

      注: 在项目工作区间执行命令。
    `,
    examples: [
      [`分析项目`, `$0 trash`],
      [`删除无用文件`, `$0 trash -d`],
      [`迁移项目文件`, `$0 trash -m`],
    ],
  });

  analyze = Option.Boolean('-a,--analyze', false, {
    description: '分析项目',
  });

  delete = Option.Boolean('-d,--delete', false, {
    description: '删除无用文件',
  });

  migrate = Option.Boolean('-m,--migrate', false, {
    description: '迁移项目文件',
  });

  async execute() {
    // this.context.logger = new Logger(this.context, 'Find');
    // new Analyze(this.context, 'Analyze').setup();
  }
}
