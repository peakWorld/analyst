import debug from 'debug';

declare global {
  // console添加新属性
  interface Console {
    vlog: debug.Debugger | Console.log;
  }

  type PickValue<T, K extends keyof T> = Pick<T, K>[K];

  type TupleToUnion<T extends readonly any[]> = T[number];

  type ExcludeItemArr<T extends Record<string, any>> = {
    [P in keyof T]: T[P] extends MeetArr<infer K> ? K : T[P];
  };

  // 扩展类型定义
  namespace NodeJS {
    interface ProcessEnv {
      PROJECTNAME: string;
    }
  }

  type MeetArr<T> = T | T[];
}
