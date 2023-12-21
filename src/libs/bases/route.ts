import { getMatchExtname } from '../../utils/index.js';
import type { Context, MatchHandler } from '../../types/clipanion.js';
import type { ResolvedFrame, ResolvedRoute } from '../../types/libs.js';

export type RouteContext = Omit<Context, 'configs' | 'addRoute'>;

export default abstract class BaseRoute {
  abstract setup(urls: string[]): Promise<void>;

  abstract getRoutesAndHandlers(): Promise<{
    routes: ResolvedRoute[];
    handlers: MatchHandler[];
  }>;

  /**
   * 只有两种路由
   * 真实路由 路径 => 文件地址
   * 虚拟路由 virtual:x => 文件地址
   */
  protected routes!: ResolvedRoute[];

  protected handlers!: MatchHandler[];

  protected macthExt!: string[];

  /**
   * 处理正则,转化成真实路由
   */
  protected matchRegexRoute() {}

  constructor(
    protected ctx: RouteContext,
    protected alias: Record<string, string>,
    protected frame: Partial<ResolvedFrame>,
  ) {
    this.routes = [];
    this.handlers = [];
    this.macthExt = getMatchExtname(frame);
  }
}

// 定义了构造函数的interfeace无法被implements
export interface IBaseRoute {
  new (
    ctx: RouteContext,
    alias: Record<string, string>,
    frame: Partial<ResolvedFrame>,
  ): BaseRoute;
}
