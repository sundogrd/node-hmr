/*
 * @Author: luffylv
 * @Date: Mon Aug 19 2019
 * @Description: stream helper. Use to judge stream type
 */
'use strict';
const Stream = require('stream');

const isStream = stream =>
    stream !== null &&
    typeof stream === 'object' &&
    stream instanceof Stream.Stream &&
    typeof stream.pipe === 'function';

isStream.writable = stream =>
    isStream(stream) &&
    stream.writable !== false &&
    typeof stream._write === 'function' &&
    typeof stream._writableState === 'object';

isStream.readable = stream =>
    isStream(stream) &&
    stream.readable !== false &&
    typeof stream._read === 'function' &&
    typeof stream._readableState === 'object';

isStream.duplex = stream =>
    isStream.writable(stream) &&
    isStream.readable(stream);

isStream.transform = stream =>
    isStream.duplex(stream) &&
    typeof stream._transform === 'function' &&
    typeof stream._transformState === 'object';

module.exports = isStream;
