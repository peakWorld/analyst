#!/usr/bin/env node
/**
 * 命令行相关
 */
import { Command } from 'commander';
import migrateFileSetup from './entry/migrate-file.js';
import SableLog from './utils/log.js'
import { isNotCommand } from './utils/system.js'

(() => {
  // 非命令行模式入口
  if (isNotCommand) {
    migrateFileSetup({ debug: true, config: 'acb.json'});
    return
  }
  const program = new Command();
  // 初始化日志输出
  SableLog.setUp()

  // 迁移项目中用到的子项目中的静态资源
  program
    .command('assets')
    .description('迁移子项目中的静态资源')
    .version('0.0.1', '-v, --version')
    .option('-x, --config <configPath>', '通过配置文件使用工具', (configPath) => configPath)
    .option('-d, --debug', '输出工具内部日志')
    .action((options) => {
      migrateFileSetup(options);
    })

  program.parse(process.argv);
})()

// demo
// program
//   .command('clone <source> [destination]')
//   .description('clone a repository into a newly created directory')
//   .action((source, destination) => {
//     console.log('clone command called', source, destination);
//   });



