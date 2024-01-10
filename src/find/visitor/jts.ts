import * as t from '@babel/types';
import type { Visitor } from '@babel/core';
import type { Ctx } from '../../types/find.js';
import type JsParser from '../../core/bases/parsers/js.js';

export default (search: string) => (ctx: Ctx, parser: JsParser) => {
  const mul = search.split(',');

  const visitor: Visitor = {
    exit({ node }) {
      if (t.isProgram(node)) {
        if (mul.find((it) => parser.source.includes(it))) {
          return ctx.addFind_Result();
        }
      }
    },
  };
  return visitor;
};
