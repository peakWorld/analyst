import process from 'process';
import { fileURLToPath } from 'url';

export const env = process.env.NODE_ENV;

export const isNotCommand = env === 'debug' || env === 'dev';

export const cwd = process.cwd();

export const sablePwd =
  fileURLToPath(import.meta.url).split(process.env.PROJECTNAME)[0] +
  process.env.PROJECTNAME;
