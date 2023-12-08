import { Command } from 'clipanion';

export default class DevViteCommand extends Command {
  static paths = [[`dev`]];

  static usage = Command.Usage({
    category: `My category`,
    description: `加快本地vue2项目开发速度`,
    details: `
      使用vite在本地开发vue2老旧项目, 几乎不改动原项目代码

      注: 在项目工作区间执行命令。
    `,
    examples: [[`启动项目`, `$0 dev`]],
  });

  async execute() {
    this.context.stdout.write(`DevViteCommand`);
  }
}
