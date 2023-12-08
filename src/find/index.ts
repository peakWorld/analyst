import { Command, Option } from 'clipanion';

export default class FindCommand extends Command {
  text = Option.String('-t,--text', {
    required: true,
    description: '需要查找的文本',
  });

  static paths = [[`find`]];

  static usage = Command.Usage({
    category: `My category`,
    description: `批量修改后、加速验证工具`,
    details: `
      1、批量修改文件, 需要验证所有改动处的正确性; 根据文本找出每个文件对应的路由, 方便验证
        1.1 公共依赖改变, 涉及多个路由
        1.2 依赖层级过深, 可能涉及多个路由(废弃路由等)
      2、接手新项目时, 根据文本（特殊唯一标记）找到路由对应的文件

      注: 在项目工作区间执行命令。
    `,
    examples: [[`基本例子`, `$0 stash -s xx`]],
  });

  async execute() {
    this.context.stdout.write(`FindCommand: ${this.text}`);
  }
}
