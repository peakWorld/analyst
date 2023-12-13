import { getMatchExtname } from '../../utils/index.js';
import type { Context } from '../../types/clipanion.js';
import type { ResolvedFrame } from '../../types/libs.js';

export type RouteContext = Omit<Context, 'configs'>;

export default abstract class BaseRoute {
  abstract setup(urls: string[]): Promise<void>;

  abstract getRoutes(): Promise<any>;

  protected routes!: Record<string, string>;

  protected macthExt!: string[];

  constructor(
    protected ctx: RouteContext,
    protected alias: Record<string, string>,
    protected frame: ResolvedFrame,
  ) {
    this.routes = {};
    this.macthExt = getMatchExtname(frame);
  }
}

// 定义了构造函数的interfeace无法被implements
export interface IBaseRoute {
  new (ctx: RouteContext): BaseRoute;
}
