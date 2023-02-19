import { Options } from '../interfaces/migrate-file.js';

export const defaultOptions: Partial<Options> = {
  alias: ['@assets', '@img'],
  isVue: true,
  useVite: false,
  migrateImage: false,
  migrateStyle: true,
  stylePreprocess: 'less',
};
