/*
 * @Author: luffylv
 * @Date: Mon Aug 19 2019
 * @Description: for node server hmr middleware
 * @Use:
 *  // 开发环境开启热更新
 *  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
 *      await hmr(app, {
            views: config.template.path,
            config: require('../../webpack.config'),
            compileDone: () => console.log('done');
        });
 *  }
 *
 *  config
 *  hotClient
 *  devMiddleware
 *  views
 *  compileDone
 *
 *  {
 *     hotClient
 *     close
 *     devMiddleware
 *  }
 */

const koaWebpack = require('koa-webpack');
const { renderWrapper, renderPage } = require('./render');
const noop = () => {};

/**
 * koa2热更新中间件，在koa-webpack基础上进行封装。
 * @param {*} app app应用
 * @param {object} option 选项
 * @returns {object} 返回koaWebpack instance 
 */
module.exports = async function (app, option) {
    let { hotClient, devMiddleware, config, compileDone = noop, views, compiler } = option;
    if (typeof compileDone !== 'function') {
        compileDone = noop;
    }
    const mid = await koaWebpack({
        compiler,
        devMiddleware: Object({}, devMiddleware),
        config,
        hotClient: Object.assign({}, {
            reload: false, // 不重刷页面
            hmr: true // 开启热更新
        }, hotClient)
    });
    app.use(mid);
    // hack render方法
    app.use(renderWrapper(mid, views));
    mid.devMiddleware.waitUntilValid(compileDone.bind(mid, mid));
    return mid;
};

module.exports.renderPage = renderPage;
