// 项目命令行配置
export interface SableConfigs {
  entry: string[];
  routes: string[] | Record<string, string>;
  frames: string[]; // uniapp|nextjs
  styles: Array<string>; // 全局样式文件
  alias: Record<string, string>;
}

// 解析后配置
export interface ResolvedFrame {
  uniapp: boolean;

  vue2: boolean;
  vue3: boolean;
  react: boolean;

  scss: boolean;
  less: boolean;
}

export interface SableResolvedConfigs {
  entry: string[];
  routes: Record<string, string>;
  frames: Partial<ResolvedFrame>;
  alias: Record<string, string>;
}
