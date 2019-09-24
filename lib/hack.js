/* eslint-disable require-jsdoc */
'use strict';

const Module = require('module');
const load = require('./module');
function hackModule(mod, filename) {
    if (typeof filename !== 'string') {
        throw new Error('Filename must be a string');
    }
    // 文件所在目录
    const targetPath = Module._resolveFilename(filename, mod);
    // 文件模块
    const targetMod = new Module(targetPath, mod, false);
    // 自定义加载模块
    // 原生Module模块会针对不同文件的扩展名调用不同的处理方法，.js文件会读取文件内容并且直接使用Module._compile方法调用vm进行编译
    // 我们需要做的的就是对这部分代码进行hack
    load(targetMod);

    return targetMod.exports;
}


function hack(filename) {
    //render.js -> entry.js -> index.js -> target
    return hackModule(module.parent.parent.parent.parent, filename);
}

module.exports = hack;


delete require.cache[__filename]