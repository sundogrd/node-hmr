/* eslint-disable require-jsdoc */
/*
* 获取流的数据并转为字符串
* @param {*} stream
* @returns
*/
const {join, dirname, extname, resolve} = require('path');
const isStream = require('./stream');
const ejs = require('ejs');
const hackableRequire = require('../lib/hack');
let middlewareInstance = null;

/**
 * 读取可读stream并转为字符串
 * @param {*} stream 可读流
 * @returns {*} 流转换成功后的字符串
 */
async function stream2str(stream) {
    if (!isStream.readable(stream)) {
        console.error('不是一个可读流');
        return '';
    }
    let str = '';
    let page = await new Promise((resolveP, reject) => {
        stream.on('data', function (data) {
            str += data.toString();
        });
        stream.on('end', function () {
            resolveP(str);
        });
        stream.on('error', function (err) {
            reject(err);
        });
    });
    return page;
}


/**
 * 渲染内存中的界面
 * @param {*} mid 中间件实例
 * @param {string} [filename=''] 文件名
 * @param {*} [data={}] 渲染数据
 * @returns {*} 字符串
 */
async function renderPage(mid, filename = '', data = {},){
    try {
        if (!filename) {
            throw new Error('You must pass valid filename!');
        }
        const stream = mid.devMiddleware.fileSystem.createReadStream(filename);
        let page = await stream2str(stream);
        page = ejs.render(page, data);
        return page;
    } catch (error) {
        throw error;
    }
}


/**
 * 修改渲染引擎，使其从内存中读取模板
 * @param {*} mid koaWebpack中间件实例
 * @returns {*} 渲染后端字符串模板
 */
function engineSourceHack(mid) {
    return async (rel, data) => {
        try {
            return await renderPage(mid, rel, data);
        } catch (err) {
            throw err;
        }
    };
}

/**
 * 针对koa-views 或者 @futu/render组件做一点修改,使其getPaths方法从内存中读取
 * @param {*} hackable 可修改的模块
 * @returns {*} null
 */
function hackModule(hackable) {
    hackable._$set$_('getPaths', getPathsProxy);
    // console.log(hackable._$get$_('getPaths'));
}


/**
 * 代理getPaths方法，使其从内存中获取文件
 * @param {*} abs 根目录
 * @param {*} rel 相对目录
 * @param {*} ext 扩展名
 * @returns {Promise} Promise
 */
function getPathsProxy(abs , rel , ext) {
    const fs = middlewareInstance.devMiddleware.fileSystem;
    const p = new Promise((resolveP, reject) => {
        try {
            const s = fs.statSync(resolve(join(abs, rel)));
            resolveP(s);
        }catch(err) {
            reject(err);
        }
    });
    return p.then(stats => {
        if (stats.isDirectory()) {
            return {
                rel: join(rel, `index.${ext}`),
                ext,
                abs: join(abs, dirname(rel), rel)
            };
        }
        return {
            rel,
            ext: extname(rel).slice(1),
            abs
        };
    }).catch(err => {
        // 不是合法的文件/目录
        if (!extname(rel) || extname(rel).slice(1) !== ext) {
            return getPathsProxy(abs, `${rel}.${ext}`, ext);
        }
        throw err;
    });
}

/**
* 代替koa-view的render中间件包装，hack render方法，使其从内存中加载界面
* @param {*} mid webpack-dev-middleware中间件实例
* @param {*} renderOptions koa-views 的选项参数
* @param {*} renderMidPath 需要hack的中间件路径
* @returns {*} 中间件
*/
function renderWrapper(mid, renderOptions, renderMidPath) {
    middlewareInstance = mid;
    // 使模块可以hack
    const hackableRenderModule = hackableRequire(renderMidPath);

    // 具体的hack
    hackModule(hackableRenderModule);
    // 添加自定义渲染引擎
    renderOptions[1] = Object.assign({}, {
        engineSource: {
            'ejs': engineSourceHack(mid)
        }
    }, renderOptions[1]);

    // hack 渲染引擎
    return hackableRenderModule(...renderOptions);
}

exports.renderWrapper = renderWrapper;
exports.renderPage = renderPage;