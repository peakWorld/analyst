// import type { Visitor } from '@babel/core';
import { AstProjectOptions } from '../interface.js';

// 命令行参数
export interface CommandOptions {
  entry: string;
}

export interface Rewrite {
  from: string | string[];
  to?: string;
  dirname: string;
}

// 配置文件
export interface FileConfig {
  alias: Record<string, string>;
  entry: string;
  aliasBase: string;
  rewrite: Rewrite[];
}

// 传给主程序的参数
export interface MainOptions extends AstProjectOptions {
  entry: string;
}
