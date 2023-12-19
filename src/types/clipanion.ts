import { CommandKey, MatchHandlerType } from './constant.js';
import type { BaseContext } from 'clipanion';
import type Logger from '../libs/log.js';
import type { SableResolvedConfigs } from './libs.js';

export interface Context extends BaseContext {
  key: CommandKey;
  logger: Logger;
  appeared: Set<string>;
  configs: SableResolvedConfigs & { handlers: MatchHandler[] };
}

export interface MatchHandler {
  type: MatchHandlerType;
  match: RegExp;
  handler: (...arg: string[]) => string;
}
