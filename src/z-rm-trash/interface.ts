import type ContextUtils from './context.js';
import type { LANG } from '../consts.js';

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
  entry: string;
  aliasBase: string;
  readConfig: boolean;
  alias: Record<string, string>;
  rewrite: Rewrite[];
  include: string[];
}

// 传给主程序的参数
export interface MainOptions extends AstProjectOptions {
  entry: string;
}

export interface ParsingRsp {
  imports: string[];
  statics: string[];
}

export interface DyParsingRsp extends ParsingRsp {
  dyImports: string[];
}

export interface Context extends AstProjectOptions {
  /** 已处理文件 */
  parsed: Set<string>;
  /** 静态资源 */
  statics: Set<string>;
  /** 动态加载 */
  dynamics: Set<string>;
  /** .d.ts */
  dts: Set<string>;

  currentUrl: string;
  dirUrl: string;

  lang?: LANG;

  $utils: ContextUtils;
}

export interface AstProjectOptions {
  deps: string[];
  aliasMap: Record<string, string>;
  alias: string[];
  aliasBase: string;
  include: string[];
  migrate: Record<string, Omit<Rewrite, 'from'>>;
}
