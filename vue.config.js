// const { defineConfig } = require('@vue/cli-service')
// module.exports = defineConfig({
//   transpileDependencies: true
// })
const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  lintOnSave:false,
  chainWebpack: (config) => {
    config.module.rules.delete('svg')
    config.resolve.symlinks(true)
    config.resolve.alias
      .set('@', resolve('src'))
      .set('~@', resolve('src/assets'))
      .set('@c', resolve('src/components'))
      .set('static', resolve('src/static'))
    config.module
      .rule('svg-sprite-loader')
      .test(/\.svg$/)
      .include.add(resolve('src/icons')) // 处理svg目录
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
      })
  },
}
