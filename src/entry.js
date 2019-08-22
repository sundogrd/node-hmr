/*
 * @Author: breakinferno
 * @Date: Mon Aug 19 2019
 * @Description: for node server hmr middleware
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
    let { hotClient, devMiddleware, config, compileDone = noop, views = {
        options: {
            opt: null,
            root: '',
        },
        render: ''
    }, compiler } = option;
    const {render, options} = views;
    const renderOptions = Object.assign({}, options);
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
    app.use(renderWrapper(mid, renderOptions, render));
    mid.devMiddleware.waitUntilValid(compileDone.bind(mid, mid));
    return mid;
};

module.exports.renderPage = renderPage;
