import { RouteType, FileType } from '../types/constant.js';
import type { StyleVisitor } from '../libs/bases/parsers/style.js';
import type { JsVisitor } from '../libs/bases/parsers/js.js';

// 项目命令行配置
export interface SableConfigs {
  entry: string[]; // 入口文件
  routes: string[] | Record<string, string>; // 路由入口文件<fileUrl>|路由配置<route,fileUrl>
  frames: string[]; // 框架有特殊配置 uniapp|nextjs
  styles: Array<string>; // 全局样式文件
  alias: Record<string, string>; // 别名
}

// 解析后配置
export interface ResolvedFrame {
  uniapp: boolean;
  ts: boolean;

  vue2: boolean;
  vue3: boolean;
  react: boolean;

  scss: boolean;
  less: boolean;
}

export interface ResolvedRoute {
  fileUrl: string;
  type: RouteType;
  path?: string;
  extra?: Record<string, string>;
}

export interface ResolvedConfigs {
  entry: string[];
  routes: ResolvedRoute[];
  frames: Partial<ResolvedFrame>;
  alias: Record<string, string>;
}

export interface Visitor {
  type: FileType[];
  handler: StyleVisitor | JsVisitor;
}

export type ResolvedVisitor = {
  [T in Partial<FileType>]: T extends
    | FileType.Css
    | FileType.Less
    | FileType.Scss
    ? Array<StyleVisitor>
    : T extends FileType.Js | FileType.Ts
    ? Array<JsVisitor>
    : any[];
};
