#!/usr/bin/env node
/**
 * 命令行相关
 */
import dotenv from 'dotenv';
dotenv.config();
import { Command } from 'commander';
import applyStashSetup from './z-apply-stash/index.js';
import rmTrashSetup from './z-rm-trash/index.js';
import { SableLog, isNotCommand } from './utils/index.js';

(() => {
  try {
    // 非命令行模式入口
    if (isNotCommand) {
      new SableLog('sable:assets');
      rmTrashSetup({
        entry:
          '/Users/windlliu/twk/analyst/.cache/tencent-pacs-frontend/.trash.ts',
      });
      return;
    }
    const program = new Command();

    // C1: 恢复stash误删资源
    program
      .command('stash')
      .description('恢复stash资源')
      .version('0.0.1', '-v, --version')
      .option('-s, --search <text>', '搜索条件')
      .action((options) => {
        new SableLog('sable:stash');
        applyStashSetup(options);
      });

    // C2: 项目处理
    program
      .command('trash')
      .description('删除项目中无用文件')
      .version('0.0.1', '-v, --version')
      .option('-e, --entry <text>', '配置文件')
      .action((options) => {
        new SableLog('sable:trash');
        rmTrashSetup(options);
      });

    program.parse(process.argv);
  } catch (err) {
    console.log(err);
  }
})();

// demo
// program
//   .command('clone <source> [destination]')
//   .description('clone a repository into a newly created directory')
//   .action((source, destination) => {
//     console.log('clone command called', source, destination);
//   });
