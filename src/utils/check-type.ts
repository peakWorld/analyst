export default class CheckTye {
  private static checkType(data: unknown) {
    return Object.prototype.toString.call(data).slice(8, -1).toLowerCase();
  }

  static isObject(data: unknown): data is Record<string, any> {
    return ['object'].includes(this.checkType(data));
  }

  static isBasicType(data: unknown) {
    return [
      'null',
      'undefined',
      'string',
      'number',
      'boolean',
      'symbol',
    ].includes(this.checkType(data));
  }

  static isNumber(data: unknown): data is number {
    return ['number'].includes(this.checkType(data));
  }

  static isString(data: unknown): data is string {
    return ['string'].includes(this.checkType(data));
  }

  static isSet<T = any>(data: unknown): data is Set<T> {
    return ['set'].includes(this.checkType(data));
  }

  static isMap<T = any, K = any>(data: unknown): data is Map<T, K> {
    return ['map'].includes(this.checkType(data));
  }

  static isFunc(data: unknown) {
    return ['function', 'asyncfunction'].includes(this.checkType(data));
  }

  static isArray<T = any>(data: unknown): data is Array<T> {
    return ['array'].includes(this.checkType(data));
  }

  static isReference(data: unknown) {
    return this.isArray(data) || this.isObject(data) || this.isFunc(data);
  }
}
