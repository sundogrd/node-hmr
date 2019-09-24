/*
 * @Author: breakinferno
 * @Date: Mon Aug 19 2019
 * @Description: for node server hmr middleware
 */

const koaWebpack = require('koa-webpack');
const { renderWrapper, renderPage } = require('./render');
const noop = () => {};
const fs = require('fs');

const DEFAULT_OPTIONS = {
    hotClient: {
        hmr: true,
        reload: false,
        allEntries: true // 默认所有页面都启用hmr
    },
    devMiddleware: {},
    config: '',
    compiler: null,
    compileDone: noop,
    views: {
        render: 'koa-views',
        options: []
    }
}


/**
 * 获取数据的类型
 * @param {*} data 数据
 */
function getType(data) {
    return Object.prototype.toString.call(data).slice(8, -1);
}

// 由于whc只能对对象类型的入口进行处理，所以我们需要将字符串类型的入口转为数组
function modifyConfig(config) { 
    const { entry, output } = config;
    // 修改entry
    if (entry) {
        if (getType(entry) === 'String') {
            config['entry'] = [config.entry]
        } else if (getType(entry) === 'Object') {
            for (let key in entry) {
                if (getType(entry[key]) === 'String') {
                    entry[key] = [entry[key]]
                }
            }
        } 
    }else {
        throw new Error('Webpack config must have entry props')
    }

    // 修改publicPath 去掉域名
    if (!output) {
        throw new Error('Webpack config muse have output props');
    }
    const { publicPath } = output;
    if (publicPath) {
        const regx = /\/\/<%(.*)%>/
        output.publicPath = publicPath.replace(regx, '');
    }

    // 修改MiniCssExtractPlugin，使其支持hmr或者回退reload
    // 对于是否存在minicssextractplugin使用简单字符串来进行判断
    const {rules} = config.module
    const extractRegx = /mini-css-extract-plugin/im;
    if (rules && rules.length) {
        rules.forEach(rule => {
            const ruleStr = JSON.stringify(rule);
            if (extractRegx.test(ruleStr)) {
                const {use} = rule;
                for (let i=0; i< use.length; i++) {
                    if (extractRegx.test(use[i])) {
                        use[i] = {
                            loader: use[i],
                            options: {
                                hmr: true,
                                reloadAll: true
                            }
                        }
                        break;
                    }
                }
            }
        });
    }

    return config;
}

/**
 * koa2热更新中间件，在koa-webpack基础上进行封装。
 * @param {*} app app应用
 * @param {object} option 选项
 * @returns {object} 返回koaWebpack instance 
 */
module.exports = async function (app, option) {
    let {devMiddleware, hotClient, config, compileDone, compiler, views} = option;

    // 查找webpack配置
    if (!config) {
        const cwd = process.cwd();
        const arrs = cwd.split('/');
        let idx = arrs.length;
        while(idx > 0) {
            const mayPath = arrs.slice(0, idx).join('/');
            try {
                fs.accessSync(mayPath + '/webpack.config.js');
                console.log(`Got avaliable path: ${mayPath + '/webpack.config.js'}`)
                config = require(mayPath + '/webpack.config.js');
                break;
            } catch(err) {
                console.log(`Not exists path: ${mayPath + '/webpack.config.js'}`);
            }
            idx--;
        }
    }

    if(!config) {
        throw new Error('You must pass webpack config!');
    }

    if (!views || !views.render) {
        throw new Error('Node-HMR need the lib name for hack. ex: koa-views');
    }

    let {options} = views || DEFAULT_OPTIONS['views'];
    // 支持options支持对象和数组 统一转为数组
    if (getType(options) === 'Object') {
        let args = [];
        let keys = [{
            name: 'root',
            default: 'server/views'
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
                args.push(options[key['name']])
            } else {
                args.push(key['default'])
            }
        })
        options = args
    }
    if (typeof compileDone !== 'function') {
        compileDone = DEFAULT_OPTIONS['compileDone'];
    }
    const mid = await koaWebpack({
        compiler: compiler || DEFAULT_OPTIONS['compiler'],
        devMiddleware: Object.assign({}, DEFAULT_OPTIONS['devMiddleware'], devMiddleware),
        config: modifyConfig(config),
        hotClient: Object.assign({}, DEFAULT_OPTIONS['hotClient'], hotClient)
    });
    app.use(mid);
    // hack render方法
    app.use(renderWrapper(mid, options, views.render));
    mid.devMiddleware.waitUntilValid(compileDone.bind(mid, mid));
    return mid;
};

module.exports.renderPage = renderPage;
