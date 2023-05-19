import type { LANG } from './consts.js';

// 解析项目必备参数
export interface AstProjectOptions {
  deps: string[];
  aliasMap: Record<string, string>;
  alias: string[];
  aliasBase: string;
}

export interface Package {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  name: string;
}

export interface ParsingRsp {
  imports: string[];
  statics: string[];
}

export interface AstContext extends AstProjectOptions {
  /** 已处理文件 */
  parsed: Set<string>;
  /** 静态资源 */
  statics: Set<string>;

  currentUrl: string;
  dirUrl: string;

  styleLang?: LANG;
}
