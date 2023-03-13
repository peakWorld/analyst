/**
 * 主逻辑
 */
import path from 'path';
import { Options, Configs } from '../interfaces/migrate-file.js';
import { cwd, getConfigsInVueOrViteFile } from '../utils/index.js';
import Ast, { AST_CONFIG } from '../core/ast.js';

export default class Main {

  private static options: Options;

  private static configs: Configs;

  // 将配置文件中的配置生成内部参数
  private static options2Configs () {
    const { isVue } = this.options;
    if (isVue) {
      getConfigsInVueOrViteFile();
    }
    return this.options;
  }

  // Main 函数内部参数
  private static initConfigs() {
    this.configs = {
      projectPath: cwd,
      projectName: path.basename(cwd),
      ...this.options2Configs()
    };
    console.vlog('Main initConfigs', this.configs);
  }

  static setUp(options: Options) {
    this.options = options;
    const ast = new Ast(AST_CONFIG);
    ast.run();
    // 初始化配置
    this.initConfigs();
  }
}
