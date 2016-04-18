'use strict';

const request       = require('./request.js');
const Promise       = require('bluebird');

var getState = function() {
    return new Promise(function (resolve, reject) {
        request.createRequest('/api/v1/install/get_state', {
            dataType: 'json'
        }).then(function (response) {
            if ('OK' === response.status) {
                resolve(response.state)
            } else {
                reject(new Error(response));
            }

        }).catch(function (err) {
            reject(new Error(err));
        });
    });
};

var getLoggedIn = function() {
    return new Promise(function (resolve, reject) {
        request.createRequest('/api/v1/auth', {
            dataType: 'json'
        }).then(function (response) {
            if ('OK' === response.status) {
                resolve({user_loggedIn: true, username: response.username});
            } else {
                resolve({user_loggedIn: false});
            }
        }).catch(function () {
            resolve({user_loggedIn: false});
        });
    });
};

module.exports = {
    getState: getState,
    getLoggedIn: getLoggedIn
};