/*
 * @Author: breakinferno
 * @Date: Mon Aug 19 2019
 * @Description: for node server hmr middleware
 */

const koaWebpack = require('koa-webpack');
const { renderWrapper, renderPage } = require('./render');
const noop = () => {};


const DEFAULT_OPTIONS = {
    hotClient: {
        hmr: true,
        reload: false
    },
    devMiddleware: {},
    config: '',
    compiler: null,
    compileDone: noop,
    views: {
        render: '',
        options: []
    }
};

/**
 * koa2热更新中间件，在koa-webpack基础上进行封装。
 * @param {*} app app应用
 * @param {object} option 选项
 * @returns {object} 返回koaWebpack instance 
 */
module.exports = async function (app, option) {
    let {devMiddleware, hotClient, config, compileDone, compiler, views} = option;

    if (!config) {
        throw new Error('You must pass webpack config!');
    }

    if (!views || !views.render) {
        throw new Error('Node-HMR need the lib name for hack. ex: koa-views');
    }

    let {options} = views || DEFAULT_OPTIONS['views'];
    // 支持options支持对象和数组 统一转为数组
    if (Object.prototype.toString.call(options).slice(8, -1) === 'Object') {
        let args = [];
        let keys = [{
            name: 'root',
            default: ''
        }, {
            name: 'opts',
            default: {
                map: {
                    html: 'ejs'
                }
            }
        }, {
            name: 'config',
            default: {}
        }];
        keys.forEach(key => {
            if (key['name'] in options) {
                args.push(options[key['name']]);
            } else {
                args.push(key['default']);
            }
        });
        options = args;
    }
    if (typeof compileDone !== 'function') {
        compileDone = DEFAULT_OPTIONS['compileDone'];
    }
    const mid = await koaWebpack({
        compiler: compiler || DEFAULT_OPTIONS['compiler'],
        devMiddleware: Object({}, DEFAULT_OPTIONS['devMiddleware'], devMiddleware),
        config,
        hotClient: Object.assign({}, DEFAULT_OPTIONS['hotClient'], hotClient)
    });
    app.use(mid);
    // hack render方法
    app.use(renderWrapper(mid, options, views.render));
    mid.devMiddleware.waitUntilValid(compileDone.bind(mid, mid));
    return mid;
};

module.exports.renderPage = renderPage;
