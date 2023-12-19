# 分析项目

## 项目开发
* 执行`npm run build:watch`, 开启文件监听
* 执行`npm start`, 启动项目

## 链接命令行
* 执行`sudo npm link`

## 模块
[clipanion](https://github.com/arcanis/clipanion)

## Class
```ts
class Test {
  // 静态变量
  private static st1;
  static st2;

  // 私有｜受保护｜公有变量
  private t1;
  protected t2;
  t3;

  // 私有｜受保护函数
  private tb1() {}
  protected tb2() {}

  // 构造函数
  constructor() {}

  // 公有函数
  tb3() {}
  async tb4() {}
}
```