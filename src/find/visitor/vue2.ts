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
            ctx.addR_Pending(url);
          }
        });
      }

      if (mul.find((it) => tag.includes(it))) {
        return ctx.addFind_Result();
      }
      const isAttrExit = mul.find((it) => {
        return attrsList.some(
          ({ name, value }) => name.includes(it) || value.includes(it),
        );
      });
      if (isAttrExit) {
        return ctx.addFind_Result();
      }
    },
    Text(node) {
      const { text } = node;
      if (mul.find((it) => text.includes(it))) {
        return ctx.addFind_Result();
      }
    },
    Expression(node) {
      const { text } = node;
      if (mul.find((it) => text.includes(it))) {
        return ctx.addFind_Result();
      }
    },
  };
  return visitor;
};
