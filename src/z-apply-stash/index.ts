/**
 * TODO
 * 1. 恢复stash误删除资源
 *
 * DEBUG=* sable stash -s 'vite'
 */
import { CommandOptions } from './interface.js';
import Main from './main.js';

export default function setup(commandOptions: CommandOptions) {
  console.vlog('执行命令 sable stash');

  // 1. 读取command配置
  const { search } = commandOptions;

  // 2. 解析command配置, 读取设置相关信息
  const options = { searchText: search };

  // 3. 初始化, 传入相关配置
  new Main(options).setup();
}
