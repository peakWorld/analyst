import { Options } from './interface.js';

export const defaultOptions: Partial<Options> = {
  base: 'src',
  alias: [
    { from: '@assets', to: 'assets/styles' },
    { from: '@img', to: 'assets/imgs' },
  ],
  isVue: true,
  stylePreprocess: 'less',
};
