import debug from 'debug';

declare global {
  type PickValue<T, K extends keyof T> = Pick<T, K>[K];

  // 扩展类型定义
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
    }
  }

  // packagejson
  interface PackageJson {
    name: string;
    version: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  }

  // 扩展语法
  type Optinonal<T> = T extends any[] ? [] | T : T | undefined | null;

  // 扩展Prototype
  type AnyObj = Record<string, any>;

  interface Object {
    /** 合并对象(修改原对象) */
    _merge: <T extends AnyObj>(args: T[]) => void;

    /** 合并对象(返回新对象) */
    merge_: <T extends AnyObj>(args: T[]) => any; // TODO ts

    /** 批量修改对象中的值(返回新对象) */
    _map: <T extends AnyObj>(cb: (v: T[keyof T], k?: keyof T) => any) => T;

    /** 批量修改对象中的值 */
    _forEach: <T extends AnyObj>(
      cb: (v: T[keyof T], k?: keyof T) => any,
    ) => void;

    /** 获取属性(根据k模糊匹配, 最先匹配到的) */
    _get: (
      k: string,
      cb?: (v: string, k?: string) => boolean,
    ) => Optinonal<[any, string]>; // TODO ts

    /** 过滤属性(修改原对象) */
    _filter: <T extends AnyObj, K extends Array<keyof T>>(k: K) => void; // TODO ts

    /** 过滤属性(返回新对象) */
    filter_: <T extends AnyObj, K extends Array<keyof T>>(k: K) => AnyObj; // TODO ts
  }
}
