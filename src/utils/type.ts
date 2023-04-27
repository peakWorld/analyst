export function checkType(data: unknown) {
  return Object.prototype.toString.call(data).slice(8, -1).toLowerCase();
}

export function isObject(data: unknown): data is Record<string, any> {
  return ['object'].includes(checkType(data));
}

export function isBasicType(data: unknown) {
  return [
    'null',
    'undefined',
    'string',
    'number',
    'boolean',
    'symbol',
  ].includes(checkType(data));
}

export function isNumber(data: unknown) {
  return ['number'].includes(checkType(data));
}

export function isFunc(data: unknown) {
  return ['function', 'asyncfunction'].includes(checkType(data));
}

export function isArray(data: unknown) {
  return ['array'].includes(checkType(data));
}

export function isReference(data: unknown) {
  return isArray(data) || isObject(data) || isFunc(data);
}

export function isError(data: unknown) {
  return data instanceof Error;
}
