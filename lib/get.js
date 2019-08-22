'use strict';
module.exports = `
Object.defineProperty(module.exports, '_$get$_', {
    enumerable: false,
    value: function _$get$_() {
        const param = arguments[0];
        if (param && typeof param === 'string') {
            return eval(param);
        } else {
            return null;
        }
    },
    writable: true
})`;