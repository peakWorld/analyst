import { CommandKey, MatchHandlerType, FileType } from './constant.js';
import type { BaseContext } from 'clipanion';
import type Logger from '../core/log.js';
import type { ResolvedConfigs, ResolvedVisitor, Visitor } from './libs.js';
import type Vue2Parser from '../core/bases/parsers/vue2.js';
import type StyleParser from '../core/bases/parsers/style.js';
import type JsParser from '../core/bases/parsers/js.js';

export interface MatchHandler {
  type: MatchHandlerType;
  match: RegExp;
  handler: (...arg: string[]) => string;
}

export interface Current {
  processing: string;
  pending: string[];
  handled: Set<string>;
  path: string; // 当前路由
  type: FileType;
}

export interface Parsers {
  vue2: typeof Vue2Parser;
  style: typeof StyleParser;
  js: typeof JsParser;
}

export interface Context extends BaseContext {
  key: CommandKey;
  logger: Logger;
  appeared: Set<string>; // 已经处理过的文件
  current: Current; // 当前路由的相关信息
  visitors: ResolvedVisitor; // 逻辑处理
  configs: ResolvedConfigs & { handlers: MatchHandler[] }; // 公共配置
  parsers: Parsers; // 解析器
  formatting: Set<string>; // 等待格式化

  addA_Route: (fileUrl: string, path?: string, extra?: AnyObj) => void; // 新增路由
  setA_Current: (fileUrl: string, path?: string) => Current; // 当前路由: 正在｜已经 处理文件
  addA_Pending: (fileUrl: string) => void; // 当前路由: 将要 处理文件
  restA_Current: () => void; // 当前路由: 重置
  needA_Gen: (type?: FileType) => boolean; // 是否需要生成文件
  needA_Parse: (fileUrl?: string) => boolean; // 是否需要解析文件
  addA_Formatting: (fileUrl?: string) => void; // 需要格式化文件

  addVisitor: (visitor: Visitor) => void; // 新增处理逻辑
}
