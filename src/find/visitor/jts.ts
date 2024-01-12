import * as t from '@babel/types';
import type { Visitor } from '@babel/core';
import type { Ctx } from '../../types/find.js';
import type JsParser from '../../core/bases/parsers/js.js';

export default (search: string) => (ctx: Ctx, parser: JsParser) => {
  const mul = search.split(',');

  const visitor: Visitor = {
    exit({ node }) {
      if (t.isProgram(node)) {
        mul.forEach((it) => {
          if (parser.source.includes(it)) ctx.addFind_Result(it);
        });
      }
    },
  };
  return visitor;
};
