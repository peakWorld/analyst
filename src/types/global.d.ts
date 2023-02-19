import debug from 'debug';

declare global{

  // console添加新属性
  interface Console {
    vlog: debug.Debugger | Console.log
  }

  type PickValue<T, K extends keyof T> = Pick<T, K>[K]

  type TupleToUnion<T extends readonly any[]> = T[number]
}

