/** 命令行类型 */
export enum CommandKey {
  FIND = 'Find',
}

/** 匹配处理类型 */
export enum MatchHandlerType {
  Tag = 'tag', // 标签
}

/** 文件类型 */
export enum FileType {
  Js = 'js',
  Ts = 'ts',

  Css = 'css',
  Less = 'less',
  Scss = 'scss',

  Vue = 'vue',

  Jsx = 'jsx',
  Tsx = 'tsx',

  Json = 'json',
  Wxss = 'wxss',
  Wxml = 'wxml',
  Wxs = 'wxs',

  Html = 'html', // html文本
}

/** 路由类型 */
export enum RouteType {
  Reality = 'reality',
  Virtual = 'virtual',
}
