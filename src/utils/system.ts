import process from 'process';

const env = process.env.NODE_ENV

export function getCwd() {
  return process.cwd()
}
export const isNotCommand =  env === 'debug' || env === 'dev'
