import type { BaseContext } from 'clipanion';
import type Logger from '../libs/log.js';
import type { SableResolvedConfigs } from './libs.js';

export enum CommandKey {
  FIND = 'Find',
}

export interface Context extends BaseContext {
  key: CommandKey;
  logger: Logger;
  appeared: Set<string>;
  configs: SableResolvedConfigs & { handlers: MatchHandler[] };
}

export enum MatchHandlerType {
  Tag = 'tag', // 标签
}

export interface MatchHandler {
  type: MatchHandlerType;
  match: RegExp;
  handler: (...arg: string[]) => string;
}
