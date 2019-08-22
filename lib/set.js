'use strict';
module.exports = `
Object.defineProperty(module.exports, '_$set$_', {
    enumerable: false,
    value: function _$set$_() {
        const key = arguments[0];
        const value = arguments[1];

        if (key && typeof key === 'string') {
            const setExp =  key + ' = value'
            eval(setExp);
        } else {
            throw new Error('_$set$_ expect a key of string')
        }
    },
    writable: true
})`;