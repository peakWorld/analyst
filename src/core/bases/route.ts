import { getMatchFileType } from '../../utils/index.js';
import type { Context, MatchHandler } from '../../types/clipanion.js';
import type { ResolvedFrame, ResolvedRoute } from '../../types/libs.js';
import type { FileType } from '../../types/constant.js';

export type RouteContext = Omit<
  Context,
  'configs' | 'addRoute' | 'setR_Now' | 'addR_Pending'
>;

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
   *
   * 正则模式路由, 则直接处理得到真实路由
   */
  protected routes!: ResolvedRoute[];

  protected handlers!: MatchHandler[];

  protected macthExt!: FileType[];

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
    this.macthExt = getMatchFileType(frame);
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
