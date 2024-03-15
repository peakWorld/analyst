// 补充postcss缺失类型声明

declare module 'postcss' {
  interface AtRule {
    mixin: boolean;
    variable: boolean;
  }
}
