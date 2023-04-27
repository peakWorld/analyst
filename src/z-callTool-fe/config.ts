// import dotenv from 'dotenv';
// dotenv.config();

const PROJECT = '/Users/windlliu/wk/CallTool-FE';
export const SRC_PATH = PROJECT + '/src';
export const ENTRY_PATH = SRC_PATH + '/main.js';
export const ROUTE_PATH = SRC_PATH + '/router/index.js';

export const EXT = ['.js', '.vue'];

export const AST_CONFIG = {
  parserOpts: {
    sourceType: 'module',
    plugins: ['jsx'],
    allowImportExportEverywhere: true,
  },
};
