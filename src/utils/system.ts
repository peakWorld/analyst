import process from 'process';
import { fileURLToPath } from 'url';
import pkage from '../../package.json' assert { type: 'json' };
import { getOptionsByFile } from './file.js';
import type { Package } from '../interface.js';

const pkName = pkage.name;

export const env = process.env.NODE_ENV;

export const isNotCommand = env === 'debug' || env === 'dev';

export const cwd = process.cwd();

export const sablePkageJson = pkage;

export const sablePwd =
  fileURLToPath(import.meta.url).split(pkName)[0] + pkName;

export const pkageJson = getOptionsByFile<Package>('package');
