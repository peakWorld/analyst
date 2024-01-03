import type { Visitor } from 'vue-template-compiler';
import type { Ctx } from '../interface.js';

export default (search: string) => (ctx: Ctx) => {
  const mul = search.split(',');
  console.log('vue2 mul', search, mul);

  const visitor: Visitor = {
    Element(node) {
      const { tag, attrsList } = node;
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
