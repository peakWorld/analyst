import { Options } from '../interfaces/migrate-file.js'
import { getCwd } from '../utils/system.js'

export const defaultOptions: Options = {
  alias: ['@assets', '@img'],
  isVue: true,
  useVite: false,
  migrateImage: false,
  migrateStyle: true,
  stylePreprocess: 'less',
  cwd: getCwd()
}
