
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
  alias: Array<string | AliasItem>
  isVue: boolean
  useVite: boolean
  migrateImage: boolean // 迁移图片
  migrateStyle: boolean // 迁移样式
  stylePreprocess: 'less' | 'scss' // 样式预解析器

}

export interface Configs {
  projectPath: string // 命令行执行的项目路径
  projectName: string // 项目名称
}
