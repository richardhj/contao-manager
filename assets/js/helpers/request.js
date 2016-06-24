'use strict';

const xhr       = require('xhr');
const cookie    = require('cookie');
const Promise   = require('bluebird');
const merge     = require('lodash/merge');

var cookies;

// Enable cancelling of promises
Promise.config({cancellation: true});

var createRequest = function(url, props) {

    props = props || {};

    if ('' !== getToken()) {
        if (undefined === props.headers) {
            props.headers = {};
        }

        props.headers['Authorization'] = 'Bearer ' + getToken();
    }

    props = merge({}, {uri: url, json: true}, props);

    return new Promise(function(resolve, reject, onCancel) {
        var req = xhr(props, function (err, resp, body) {
            if (null === err) {
                if (resp.headers && resp.headers.authentication) {
                    setToken(resp.headers.authentication);
                }

                resolve(resp);
            } else {
                reject(err);
            }
        });

        onCancel(function() { req.abort(); });
    });
};

var setToken = function(token) {
    document.cookie = cookie.serialize(
        'cpm:token', token, {
            domain: window.location.hostname,
            secure: window.location.protocol === 'https:'
        });

    // reset cookie cache
    cookies['cpm:token'] = token;
};

var getToken = function() {

    var token = _readCookie('cpm:token');
    if (token) {
        return token;
    }

    return '';
};

function _readCookie(name,c,C,i){
    if(cookies){ return cookies[name]; }

    c = document.cookie.split('; ');
    cookies = {};

    for(i=c.length-1; i>=0; i--){
        C = c[i].split('=');
        cookies[C[0]] = C[1];
    }

    return cookies[name];
}

module.exports = {
    createRequest: createRequest,
    setToken: setToken,
    getToken: getToken
};
