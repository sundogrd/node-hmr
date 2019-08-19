/*
* 获取流的数据并转为字符串
* @param {*} stream
* @returns
*/
const path = require('path');
const isStream = require('./stream');
const ejs = require('ejs');

/**
 * 读取可读stream并转为字符串
 * @param {*} stream
 * @returns
 */
async function stream2str(stream) {
    if (!isStream.readable(stream)) {
        console.error('不是一个可读流');
        return '';
    }
    let str = '';
    let page = await new Promise((resolve, reject) => {
        stream.on('data', function (data) {
            str += data.toString();
        });
        stream.on('end', function () {
            resolve(str);
        });
        stream.on('error', function (err) {
            reject(err);
        });
    });
    return page;
}


/**
 * 渲染内存中的界面
 * @param {*} mid
 * @param {string} [filename='']
 * @param {*} [data={}]
 * @returns
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
* 代替koa-view的render中间件包装，hack render方法，使其从内存中加载界面
* @param {*} mid webpack-dev-middleware中间件实例
* @param {*} base 基本路径
* @param {*} path 实际的路径
* @returns
*/
function renderWrapper(mid, base) {
    return async (ctx, next) => {
        if (ctx.render && typeof ctx.render === 'function') {
            console.warn('will change origin render function now');
        }
        async function render(rel, data) {
            try {
                if (!rel) {
                    return next();
                }
                if (!base) {
                    base = '.';
                }
                const filename = path.resolve(base, `./${rel}.html`);
                const page = await renderPage(mid, filename, data);
                ctx.body = page;
                return;
            } catch (err) {
                console.error(err);
                return next();
            }
        }
        ctx.response.render = ctx.render = render;
        return next();
    };
}

exports.renderWrapper = renderWrapper;
exports.renderPage = renderPage;