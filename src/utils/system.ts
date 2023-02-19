import process from 'process';

export const env = process.env.NODE_ENV;

export const isNotCommand =  env === 'debug' || env === 'dev';

export const cwd = process.cwd();
