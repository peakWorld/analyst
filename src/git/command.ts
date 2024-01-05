import { Command, Option } from 'clipanion';

export default class GitCommand extends Command {
  static paths = [['git']];

  static usage = Command.Usage({
    category: `My category`,
    description: `Git相关处理`,
    details: `
      1. 误删除stash记录, 根据输入文本找到正确的stash记录, 恢复正确代码
    `,
    examples: [[`恢复stash指定记录`, `$0 git -s -t xx`]],
  });

  search = Option.String('-t,--text', { required: true });

  stash = Option.Boolean('-s,--stash', false, {
    description: '恢复stash指定记录',
  });

  async execute() {
    this.context.stdout.write(`GitCommand: ${this.stash} | ${this.search}`);
  }
}
