
/*
 * @Author: breakinferno
 * @Date: Mon Aug 19 2019
 * @Description: 一些前置检查
 */
const compare = require('./version');
// min version for support spread operator
const MIN_VERSION = '8.6.0';
/**
 * hmr中间件
 * @param {*} app
 * @param {*} options 中间件参数
 * @param {boolean} [isUse=true] 是否使用默认的环境判断，可自定义是否启用hmr功能
 */
module.exports = async (app, options, isUse = true) => {
    if (isUse && (!process.env.NODE_ENV || (!+(process.env.NODE_TEST || 0) && (process.env.NODE_ENV === 'development')))) {
        if (process && compare(process.version.slice(1), MIN_VERSION) >= 0) {
            await require('./entry')(app, options);
        } else {
            console.warn(`Can not open HMR!The current version ${process.version.slice(1)} must be over ${MIN_VERSION}`);
        }
    }
}