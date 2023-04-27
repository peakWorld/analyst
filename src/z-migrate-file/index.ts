/**
 * TODO
 * 1. 迁移子模块中的样式文件、图片等
 * 2. 清除文件内的未使用的方法、参数等
 * 3. 增量更新
 */

// 注意
// 1. 样式预处理方案 scss/less
// 2. alias路径不一致[要处理的子模块不确定、vite/webpack配置文件]

// 先提取关联关系
// 再新建文件夹、复制文件

// tencent-pacs-frontend  ✅
// tencent-pacs-imagecenter less 'miyin-pacs'
// pacs-image-viewport less 'miyin-pacs'
// tencent-pacs-login-web less 'aimis-pacs-static-new'
// tencent-pacs-manage less 'aimis-pacs-static-new'
// tencent-pacs-manage-center less 'aimis-pacs-static-new'
// tencent-pacs-partners scss 'aimis-pacs-static-new'
// tencent-pacs-webserver ✅
// tencent-pacs-webview scss 'aimis-pacs-static-new'
// tencent-pacs-wxwork scss 'aimis-pacs-static-new'
// tencent-pacs-mobile scss 'aimis-pacs-static-web'

// 测试
// sable assets -x /Users/windlliu/twk/analyst/.demo/test1.json

import type { CommandOptions, Options } from './interface.js';
import { defaultOptions } from './const.js';
import { getOptionsByFile } from '../utils/index.js';
import Main from './main.js';

// 处理命令行输入的参数
export default function setup(commandOptions: CommandOptions) {
  console.vlog('执行命令 sable assets');
  const { configPath } = commandOptions;

  // 命令行配置
  const options = {
    ...defaultOptions,
    ...getOptionsByFile<Options>(configPath),
  };

  // 初始化功能
  Main.setUp(options);
}