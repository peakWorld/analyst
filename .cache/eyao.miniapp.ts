export default (ctx) => {

  return {
    entry: ['./src/main.js'],
    routes: ['./src/pages.json', './src/pages.js'],

    // 框架
    frames: ['uniapp'],

    // 样式处理 数组 [全局样式文件]
    css: ['~@/uni.scss'],

    // 路径别名 TODO
    alias: {
      '@': './src',
      discuzq: './src/discuzq',
    },
  };
};
