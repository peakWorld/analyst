
// 命令行参数
export interface CommandOptions {
  configPath: string
}

export interface AliasItem {
  from: string[] | string;
  to: string;
}

// 命令行相关配置
export interface Options {
  base: string
  alias: Array<string | AliasItem>
  isVue: boolean // vue | react
  buildUri: string  // 项目编译配置路径(文件|文件夹)
  stylePreprocess: 'less' | 'scss' // 样式预解析器
}

export interface Configs {
  projectPath: string // 命令行执行的项目路径
  projectName: string // 项目名称
}
