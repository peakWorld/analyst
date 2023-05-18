import type Ast from './ast/index.js';
import * as T from '@babel/types';

// 解析项目必备参数
export interface AstProjectOptions {
  deps: string[];
  aliasMap: Record<string, string>;
  alias: string[];
  aliasBase: string;
  visitor: (t: typeof T, ast: Ast, fileUrl: string) => Promise<string[]>;
}

export interface ParsingCommonOptions {
  fileUrl?: string;
  codestr?: string;
  dir?: string;
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
