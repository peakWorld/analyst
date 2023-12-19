import { getMatchExtname } from '../../utils/index.js';
import type { Context, MatchHandler } from '../../types/clipanion.js';
import type { ResolvedFrame } from '../../types/libs.js';

export type RouteContext = Omit<Context, 'configs'>;

export default abstract class BaseRoute {
  abstract setup(urls: string[]): Promise<void>;

  abstract getRoutesAndHandlers(): Promise<{
    routes: Record<string, string>;
    handlers: MatchHandler[];
  }>;

  /**
   * 真实路由 路径 => 文件地址
   * 虚拟路由 virtual:x => 文件地址
   * 正则路由 regex:x => 文件地址(用$1,$2...表示待替换处)
   */
  protected routes!: Record<string, string>;

  protected handlers!: MatchHandler[];

  protected macthExt!: string[];

  constructor(
    protected ctx: RouteContext,
    protected alias: Record<string, string>,
    protected frame: Partial<ResolvedFrame>,
  ) {
    this.routes = {};
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
