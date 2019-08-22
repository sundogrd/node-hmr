/**
 * 版本比较
 * @param {*} version 被比较的版本
 * @param {*} compare 比较的版本
 * @returns {number} 0: 相等 -1: version 小于 compare 1: version 大于 compare
 */
function versionCompare (version, compare) {
    try {
        const reg = /[^0-9.]/;
        if (reg.test(version)) {
            throw new Error('版本必须是数字');
        }
        if (reg.test(compare)) {
            throw new Error('版本必须是数字');
        }
        let _v1 = version.split('.');
        let _v2 = compare.split('.');
        let _r = _v1[0] - _v2[0];
        return _r === 0 && version !== compare ? versionCompare(_v1.splice(1).join('.'), _v2.splice(1).join('.')) : _r;
    } catch (error) {
        console.log('compare version got error, ', error);
        return 0;
    }
}

module.exports = versionCompare;
