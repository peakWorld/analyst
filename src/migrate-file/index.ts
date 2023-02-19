/**
 * 主逻辑
 */
import path from 'path';
import { Options, Configs } from '../interfaces/migrate-file.js';
import { cwd } from '../utils/index.js';

export default class Main {

  private static options: Options;

  private static configs = {} as Configs;

  private static initConfigs() {
    const partialConfigs = {
      projectPath: cwd,
      projectName: path.basename(cwd),
    };
    const { alias } = this.options;

    this.configs = partialConfigs;
    console.log('options', this.options, this.configs);
  }

  static setUp(options: Options) {
    this.options = options;

    // 初始化功能配置数据
    this.initConfigs();
  }
}
