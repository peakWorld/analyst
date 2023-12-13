// 项目命令行配置
export interface SableConfigs {
  entry: string[];
  route: string[] | Record<string, string>;
  frame: string[]; // uniapp|nextjs
  css: Array<string>; // 全局样式文件
  alias: Record<string, string>;
}

// 解析后配置
export interface ResolvedCss {
  global: string[];
  scss: boolean;
  less: boolean;
}

export interface ResolvedFrame {
  uniapp: boolean;

  vue2: boolean;
  vue3: boolean;
  react: boolean;
}

export interface SableResolvedConfigs {
  entry: string[];
  route: Record<string, string>;
  frame: Partial<ResolvedFrame>;
  css: Partial<ResolvedCss>;
  alias: Record<string, string>;
}
