import { MatchHandlerType } from '../../../types/constant.js';
import type { Visitor } from 'vue-template-compiler';
import type { Context } from '../../../types/clipanion.js';

export default (ctx: Context) => {
  // 自定义组建(标签)处理
  const handlers = ctx.configs.handlers?.filter(
    (it) => it.type === MatchHandlerType.Tag,
  );

  const visitor: Visitor = {
    Element(node) {
      const { tag } = node;

      if (handlers.length) {
        handlers.forEach(({ match, handler }) => {
          if (match.test(tag)) {
            const matches = match.exec(tag);
            const url = handler(matches[1]);
            ctx.addA_Pending(url);
          }
        });
      }
    },
  };
  return visitor;
};
