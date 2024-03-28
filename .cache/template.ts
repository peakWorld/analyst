export default () => {
  return {
    /** 公共配置 */
    entry: [],

    // 路由处理 数组 [路由入口文件]; 对象 路由配置对象
    routes: [],
    // route: {},

    // 框架 uniapp
    frames: [],

    // 样式处理 数组 [全局样式文件]
    styles: [],

    // 路径别名 TODO
    alias: {},

    /** 特定配置 */
    convert: {
      style: {},
    },
  };
};
