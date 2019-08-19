/*
 * @Author: luffylv
 * @Date: Mon Aug 19 2019
 * @Email: luffylv@futunn.com
 * @Company: Futu
 * @Description: for futu node server hmr middleware
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
const {renderWrapper, renderPage} = require('./render');
const noop = () => {};

module.exports = async function (app, option) {
    let {hotClient, devMiddleware, config, compileDone = noop, views} = option;
    if (typeof compileDone !== 'function') {
        compileDone = noop;
    }
    const mid = await koaWebpack({
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
    // 打包完毕才可以onerror 500.html
    mid.devMiddleware.waitUntilValid(compileDone.bind(mid, mid));
    // async () => {
    //     const errorPath = path.resolve(__dirname, '../../', config.template.path + '/500.html');
    //     const errorPage = await getStream(mid.devMiddleware.fileSystem.createReadStream(errorPath));
    //     koaOnError(app, { html: errorPage });
    // }
};

module.exports.renderPage = renderPage;
