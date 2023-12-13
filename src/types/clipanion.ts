import type { BaseContext } from 'clipanion';
import type Logger from '../libs/log.js';
import type { SableResolvedConfigs } from './libs.js';

// RouteHanler针对什么地方生效
export enum RouteHandlerType {
  Tag, // 标签
}

// 针对regex路由
export interface RouteHandler {
  regex: RegExp;
  handler: (...matches: string[]) => string;
  type: RouteHandlerType;
}

export interface Context extends BaseContext {
  logger: Logger;
  appeared: Set<string>;
  configs: SableResolvedConfigs;
  handlers: RouteHandler[];
}
