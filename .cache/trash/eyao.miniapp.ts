export default {
  entry: ['./src/main.js'],
  route: ['./src/pages.json', './src/pages.js'],

  // 框架语言
  frame: ['uniapp', 'vue2'],

  // 样式处理 数组 [预处理语言｜全局样式文件]; false 不处理
  css: ['scss', 'less', ['~@/uni.scss']],
  // css: false,

  // 路径别名 TODO
  alias: {
    '@': './src',
    discuzq: './src/discuzq',
  },
};
