// vue项目配置文件
export const vuePCF = [
  'vue.config.js',
  'vue.config.ts',
  'vite.config.js',
  'vite.config.ts',
];

// 没有后缀的文件, 从上往下依次匹配
export enum LANG {
  Dts = 'd.ts', // 优先级最高
  Js = 'js',
  Ts = 'ts',
  Tsx = 'tsx',
  Vue = 'vue',
  Css = 'css',
  Less = 'less',
  Scss = 'scss',
}

export const EXTS = Object.values(LANG).map((ext) => `.${ext}`);
