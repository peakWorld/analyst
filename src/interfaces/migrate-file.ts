
// 命令行参数
export interface CommandOptions {
  config: string
  debug: boolean
}

// 系统配置
export interface Options {
  alias: string[]
  isVue: boolean
  useVite: boolean
  migrateImage: boolean
  migrateStyle: boolean
  stylePreprocess: 'less' | 'scss'
  cwd: string
}
