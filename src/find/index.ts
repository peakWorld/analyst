import Base from '../libs/base.js';

// type Constructor<T = {}> = new (...args: any[]) => T;
// function mixin<TBase extends Constructor>(Base: TBase) {}

export default class Find extends Base {
  private texts = [];

  async setup(text: string) {
    if (!text) throw new Error('查询条件为空!');
    await this.loadCommandConfigFile(); // 加载 command config文件
    await this.resolveCommandConfig(); // 解析 command config
  }
}
