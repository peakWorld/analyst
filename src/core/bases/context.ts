// import type { Context } from '../../types/clipanion.js';

export const expand: ParameterDecorator = (
  target,
  propertyKey,
  parameterIndex,
) => {
  console.log(target, propertyKey, parameterIndex);
};
