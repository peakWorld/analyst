import type { Context } from '../../types/clipanion.js';

export default abstract class BaseRoute {
  abstract setup(): this;

  abstract getRoutes(): Promise<any>;

  constructor(protected ctx: Context) {}
}

// 定义了构造函数的interfeace无法被implements
export interface IBaseRoute {
  new (ctx: Context): BaseRoute;
}
