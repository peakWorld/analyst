import { MatchHandlerType } from '../../types/constant.js';
import type { Visitor } from 'vue-template-compiler';
import type { Ctx } from '../../types/find.js';

export default (search: string) => (ctx: Ctx) => {
  const mul = search.split(',');
  // 自定义组建(标签)处理
  const handlers = ctx.configs.handlers?.filter(
    (it) => it.type === MatchHandlerType.Tag,
  );

  const visitor: Visitor = {
    Element(node) {
      const { tag, attrsList } = node;

      if (handlers.length) {
        handlers.forEach(({ match, handler }) => {
          if (match.test(tag)) {
            const matches = match.exec(tag);
            const url = handler(matches[1]);
            ctx.addA_Pending(url);
          }
        });
      }

      mul.forEach((it) => {
        if (
          tag.includes(it) ||
          attrsList.some(
            ({ name, value }) => name.includes(it) || value.includes(it),
          )
        ) {
          ctx.addFind_Result(it);
        }
      });
    },
    Text(node) {
      const { text } = node;
      mul.forEach((it) => {
        if (text.includes(it)) ctx.addFind_Result(it);
      });
    },
    Expression(node) {
      const { text } = node;
      mul.forEach((it) => {
        if (text.includes(it)) ctx.addFind_Result(it);
      });
    },
  };
  return visitor;
};
