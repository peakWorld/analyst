import * as t from '@babel/types';
// import { saveDataToTmpJsonFile } from '../../utils/index.js';
import type { Visitor } from '@babel/core';
import type { Ctx } from '../interface.js';

export default (search: string) => (ctx: Ctx) => {
  const visitor: Visitor = {
    exit(path) {
      if (t.isProgram(path.node)) {
        // console.log('exit...', path.node.type);
      }
    },
  };
  return visitor;
};
