/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */
'use strict';

const Module = require('module');
const get = require('./get');
const set = require('./set');
// original IIFE start part
let moduleWrapperStartOrigin = Module.wrapper[0];
// origininal IIFE end part
let moduleWrapperEndOrigin = Module.wrapper[1];

let originRequire = null; // 原有模块的require方法
let currentMod = null; // 当前的模块

// let originJSExtension = null;

// hack Module 的IIFE，使其增加get 和 set方法
// wrap 完成之后应该得到的是这样的闭包
// (function(module, exports, __dirname, __filename){
//     'use strict';
//     (function() {
//         if (typeof module.exports === 'function' || (typeof module.exports === 'object' && module.exports !== null && Object.isExtensible(module.exports))) {
//             // 实际的引入的模块代码
//             // code here

//             // hack的get方法
//             Object.defineProperty(module.exports, '_$get$_', {
//                 enumerable: false,
//                 value: function _$get$_() {
//                     const param = arguments[0];
//                     if (param && typeof param === 'string') {
//                         return eval(param);
//                     } else {
//                         return null;
//                     }
//                 },
//                 writable: true
//             });
//             // hack的set方法
//             Object.defineProperty(module.exports, '_$set$_', {
//                 enumerable: false,
//                 value: function _$set$_() {
//                      const key = arguments[0];
//                      const value = arguments[1];
//
//                      if (key && typeof key === 'string') {
//                           const setExp = 'let ' +  key + ' = ' + value
//                           eval(setExp);
//                      } else {
//                           throw new Error('_$set$_ expect a key of string')
//                      }
//                 },
//                 writable: true
//             });
//         }
//     })();
// })();
function inject() {
    const start = `
        'use strict';
        (function() {
            if (typeof module.exports === 'function' || (typeof module.exports === 'object' && module.exports !== null && Object.isExtensible(module.exports))) {
    `;
    const end = `${get}
                 ${set}
            }
        })();
    `;
    Module.wrapper[0] = moduleWrapperStartOrigin + start;
    Module.wrapper[1] = end + moduleWrapperEndOrigin;
}


/**
 * 使用自定义的load方法进行加载模块
 * 我们需要理解的是我们需要先调用load方法，才能继续调用当前模块的子模块的相关方法
 * @param {*} mod 需要hack加载的第三方模块
 */
function load(mod) {
    // 首先更改Module的IIFE
    console.log(Module);
    inject();
    /** 
     *  此时由于我们已经hack了Module的IIFE，如果目标模块中存在require，此时require生成Module对象也会使用hack了的IIFE
     *  所以需要引入的模块的require时清除我们hack
     *  
     */
    originRequire = mod.require;
    
    // 使该模块内部的require使用原生的require
    mod.require = requireProxy;

    // 暂存一下当前模块，用于恢复当前模块的require方法
    currentMod = mod;

    // Native code
    // 对js的处理是读取文件并编译即可
    // 这里也是我们需要hack的部分
    // Module._extensions['.js'] = function(module, filename) {
    //     var content = fs.readFileSync(filename, 'utf8');
    //     module._compile(internalModule.stripBOM(content), filename);
    // };

    // mod.load会使用上面的extensions方法，所以我们需要hack extensions['.js']方法

    // extensionProxy();

    // 加载文件并且编译
    // 此时wrap的是我们修改后的IIFE
    mod.load(mod.id);
    // 模块加载完毕重置hack,避免影响其他模块的引入
    reset();
}


// function extensionProxy() {
//     originJSExtension = Module._extensions['.js'];
//     if (originJSExtension) {
//         // code 
//     }

//     // 修改js extension
//     Module._extensions['.js'] = jsExtension;
// }


// function jsExtension() {
//     const originCompile = module._compile;
// }

/**
 * 自定义的编译函数
 * @param {*} content  编译的文本字符串
 * @param {*} filename 编译的文件名
 */
// function compileProxy(content, filename) {

// }

/**
 * 第一该模块require子模块是就会重置require方法
 * @param {*} path
 * @returns
 */
function requireProxy(path) {
    // 重置IIFE wrapper
    reset();
    // 第一次重置完成之后后续的就可以继续使用原声带require方法，所以这里恢复原来的require方法
    currentMod.require = originRequire;
    // 使用原生方法require
    return originRequire.call(currentMod, path);
}

// 重置Module模块
function reset() {
    Module.wrapper[0] = moduleWrapperStartOrigin;
    Module.wrapper[1] = moduleWrapperEndOrigin;
}


module.exports = load;