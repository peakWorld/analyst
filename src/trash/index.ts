import { Command, Option } from 'clipanion';
import Analyze from './analyze/index.js';

export default class TrashCommand extends Command {
  entry = Option.String('-e,--entry', {
    description: '命令行相关配置文件',
  });

  delete = Option.Boolean('-d,--delete', false, {
    description: '删除无用文件',
  });

  migrate = Option.Boolean('-m,--migrate', false, {
    description: '迁移目录文件',
  });

  static paths = [[`trash`]];

  static usage = Command.Usage({
    category: `My category`,
    description: `项目处理`,
    details: `
      1、分析项目
      2、删除无用文件
      3、迁移目录文件

      注: 在项目工作区间执行命令。
    `,
    examples: [
      [`分析项目`, `$0 trash -e xx`],
      [`删除无用文件`, `$0 trash -e xx -d`],
      [`迁移目录文件`, `$0 trash -e xx -m`],
    ],
  });

  async execute() {
    new Analyze(this.entry);

    this.context.stdout.write(
      `TrashCommand: ${this.entry}，delete: ${this.delete}，migrate: ${this.migrate}`,
    );
  }
}
