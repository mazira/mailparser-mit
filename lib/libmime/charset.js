/**
 * This is a modified version of a file from libmime v3.1.0
 * 
 * Original:
 * https://github.com/nodemailer/libmime/blob/v3.1.0/lib/charset.js
 * Copyright (c) 2014-2017 Andris Reinman
 * 
 * Modifications:
 * Copyright (c) 2017 Ross Johnson
 * 
 * MIT licensed.
 */
'use strict';

var iconv = require('iconv-lite');
var charsets = require('./charsets');

/**
 * Character set encoding and decoding functions
 */
var charset = module.exports = {

    /**
     * Encodes an unicode string into an Buffer object as UTF-8
     *
     * We force UTF-8 here, no strange encodings allowed.
     *
     * @param {String} str String to be encoded
     * @return {Buffer} UTF-8 encoded typed array
     */
    encode: function (str) {
        return new Buffer(str, 'utf-8');
    },

    /**
     * Decodes a string from Buffer to an unicode string using specified encoding
     * NB! Throws if unknown charset is used
     *
     * @param {Buffer} buf Binary data to be decoded
     * @param {String} [fromCharset='UTF-8'] Binary data is decoded into string using this charset
     * @return {String} Decded string
     */
    decode: function (buf, fromCharset) {
        fromCharset = charset.normalizeCharset(fromCharset || 'UTF-8');

        if (/^(us\-)?ascii|utf\-8|7bit$/i.test(fromCharset)) {
            return buf.toString('utf-8');
        }

        return iconv.decode(buf, fromCharset);
    },

    /**
     * Convert a string from specific encoding to UTF-8 Buffer
     *
     * @param {String|Buffer} str String to be encoded
     * @param {String} [fromCharset='UTF-8'] Source encoding for the string
     * @return {Buffer} UTF-8 encoded typed array
     */
    convert: function (data, fromCharset) {
        fromCharset = charset.normalizeCharset(fromCharset || 'UTF-8');

        var bufString;

        if (typeof data !== 'string') {
            if (/^(us\-)?ascii|utf\-8|7bit$/i.test(fromCharset)) {
                return data;
            }
            bufString = charset.decode(data, fromCharset);
            return charset.encode(bufString);
        }
        return charset.encode(data);
    },

    /**
     * Converts well known invalid character set names to proper names.
     * eg. win-1257 will be converted to WINDOWS-1257
     *
     * @param {String} charset Charset name to convert
     * @return {String} Canoninicalized charset name
     */
    normalizeCharset: function (charset) {
        charset = charset.toLowerCase().trim();

        // first pass
        if (charsets.hasOwnProperty(charset) && charsets[charset]) {
            return charsets[charset];
        }

        charset = charset.
        replace(/^utf[\-_]?(\d+)/, 'utf-$1').
        replace(/^(?:us[\-_]?)ascii/, 'windows-1252').
        replace(/^win(?:dows)?[\-_]?(\d+)/, 'windows-$1').
        replace(/^(?:latin|iso[\-_]?8859)?[\-_]?(\d+)/, 'iso-8859-$1').
        replace(/^l[\-_]?(\d+)/, 'iso-8859-$1');

        // updated pass
        if (charsets.hasOwnProperty(charset) && charsets[charset]) {
            return charsets[charset];
        }

        // unknown?
        return 'WINDOWS-1252';
    }
};
