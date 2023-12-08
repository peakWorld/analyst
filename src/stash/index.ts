import { Command, Option } from 'clipanion';

export default class StashCommand extends Command {
  search = Option.String('-s,--search', { required: true });

  static paths = [[`stash`]];

  static usage = Command.Usage({
    category: `My category`,
    description: `恢复Git stash暂存资源`,
    details: `
      误删除stash记录, 根据输入文本找到正确的stash记录; 恢复正确代码

      注: 在项目工作区间执行命令。
    `,
    examples: [[`基本例子`, `$0 stash -s xx`]],
  });

  async execute() {
    this.context.stdout.write(`StashCommand: ${this.search}`);
  }
}
