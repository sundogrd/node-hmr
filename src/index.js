
/*
 * @Author: luffylv
 * @Date: Mon Aug 19 2019
 * @Description: 一些前置检查
 */
const compare = require('./version');
// min version for support spread operator
const MIN_VERSION = '8.6.0';
if (process && compare(process.version.slice(1), MIN_VERSION) >= 0) {
    module.exports = require('./entry');
} else {
    console.warn(`Can not open HMR!The current version ${process.version.slice(1)} must be over ${MIN_VERSION}`);
    module.exports = () => {};
}
