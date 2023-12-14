import type { BaseContext } from 'clipanion';
import type Logger from '../libs/log.js';
import type { SableResolvedConfigs } from './libs.js';

// RouteHanler针对什么地方生效
export enum RegexRouteType {
  Tag = 'tag', // 标签
}

export enum CommandKey {
  FIND = 'Find',
}

export interface Context extends BaseContext {
  key: CommandKey;
  logger: Logger;
  appeared: Set<string>;
  configs: SableResolvedConfigs;
}
