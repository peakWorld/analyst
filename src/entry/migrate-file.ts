/**
 * TODO
 * 1. 迁移子模块中的样式文件、图片等
 * 2. 增量更新
 */

// 注意
// 1. 样式预处理方案 scss/less
// 2. alias路径不一致[要处理的子模块不确定、vite/webpack配置文件]

// 先提取关联关系
// 再新建文件夹、复制文件

// tencent-pacs-frontend  ✅
// tencent-pacs-imagecenter less 'miyin-pacs'
// pacs-image-viewport less 'miyin-pacs'
// tencent-pacs-login-web less 'aimis-pacs-static-new'
// tencent-pacs-manage less 'aimis-pacs-static-new'
// tencent-pacs-manage-center less 'aimis-pacs-static-new'
// tencent-pacs-partners scss 'aimis-pacs-static-new'
// tencent-pacs-webserver ✅
// tencent-pacs-webview scss 'aimis-pacs-static-new'
// tencent-pacs-wxwork scss 'aimis-pacs-static-new'
// tencent-pacs-mobile scss 'aimis-pacs-static-web'