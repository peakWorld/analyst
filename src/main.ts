#!/usr/bin/env node
/**
 * 命令行相关
 */
import { Command } from 'commander';
import migrateFileSetup from './entry/migrate-file.js';
import { SableLog, isNotCommand } from './utils/index.js';

(() => {
  try {
    // 非命令行模式入口
    if (isNotCommand) {
      migrateFileSetup({ configPath: 'acb.json'});
      return;
    }
    const program = new Command();
    // 初始化日志输出
    // SableLog.setUp()

    // 迁移项目中用到的子项目中的静态资源
    program
      .command('assets')
      .description('迁移子项目中的静态资源')
      .version('0.0.1', '-v, --version')
      .option('-x, --configPath <configPath>', '通过配置文件使用工具', (configPath) => configPath)
      .action((options) => {
        new SableLog('sable:assets');
        migrateFileSetup(options);
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



