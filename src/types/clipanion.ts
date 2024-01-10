import { CommandKey, MatchHandlerType, FileType } from './constant.js';
import type { BaseContext } from 'clipanion';
import type Logger from '../core/log.js';
import type { ResolvedConfigs, ResolvedVisitor, Visitor } from './libs.js';

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

export interface Context extends BaseContext {
  key: CommandKey;
  logger: Logger;
  appeared: Set<string>; // 已经处理过的文件
  current: Current; // 当前路由的相关信息
  visitors: ResolvedVisitor; // 逻辑处理
  configs: ResolvedConfigs & { handlers: MatchHandler[] }; // 公共配置

  addRoute: (fileUrl: string, path?: string, extra?: AnyObj) => void; // 新增路由
  addVisitor: (visitor: Visitor) => void; // 新增处理逻辑
  setR_Now: (fileUrl: string, path?: string) => Current; // 当前路由: 正在｜已经 处理文件
  addR_Pending: (fileUrl: string) => void; // 当前路由: 将要 处理文件
  restR_Current: () => void; // 当前路由: 重置
  // getR_Processing: () => string; // 当前路由: 获取正在处理中文件
}
