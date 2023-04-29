#!/usr/bin/env node
/**
 * 命令行相关
 */
import dotenv from 'dotenv';
dotenv.config();
import { Command } from 'commander';
import migrateFileSetup from './z-migrate-file/index.js';
import applyStashSetup from './z-apply-stash/index.js';
import rmTrashSetup from './z-rm-trash/index.js';
import { SableLog, isNotCommand } from './utils/index.js';

(() => {
  try {
    // 非命令行模式入口
    if (isNotCommand) {
      new SableLog('sable:assets');
      rmTrashSetup({
        entryPath: '/Users/windlliu/wk/tencent-pacs-frontend/src/main.ts',
      });
      return;
    }
    const program = new Command();

    // C1: 迁移项目中用到的子项目中的静态资源
    program
      .command('assets')
      .description('')
      .version('0.0.1', '-v, --version')
      .option(
        '-x, --configPath <configPath>',
        '通过配置文件使用工具',
        (configPath) => configPath,
      )
      .action((options) => {
        new SableLog('sable:assets');
        migrateFileSetup(options);
      });

    // C2: 恢复stash误删资源
    program
      .command('stash')
      .description('恢复stash资源')
      .version('0.0.1', '-v, --version')
      .option('-s, --search <text>', '搜索条件')
      .action((options) => {
        new SableLog('sable:stash');
        applyStashSetup(options);
      });

    // C3: 删除项目无用文件
    program
      .command('trash')
      .description('删除项目中无用文件')
      .version('0.0.1', '-v, --version')
      .option('-e, --entryPath <text>', '项目入口')
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
