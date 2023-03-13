import { Options } from '../interfaces/migrate-file.js';

export const defaultOptions: Partial<Options> = {
  base: 'src',
  alias: [
    { from: '@assets', to: 'assets/styles' },
    { from: '@img', to: 'assets/imgs'}
  ],
  isVue: true,
  stylePreprocess: 'less',
};

// vue项目配置文件
export const vuePCF = [
  'vue.config.js',
  'vue.config.ts',
  'vite.config.js',
  'vite.config.ts',
];
