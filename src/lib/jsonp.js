/**
 * JSONP request.
 */

var Promise = require('./promise');

module.exports = function (_, options) {

    var callback = '_jsonp' + Math.random().toString(36).substr(2), response = {}, script, body;

    options.params[options.jsonp] = callback;

    if (_.isFunction(options.beforeSend)) {

        _.warn('beforeSend has been deprecated in ^0.1.17. ' +
            'Use transformRequest instead.'
        );

        options.beforeSend.call(this, {}, options);
    }

    return new Promise(function (resolve) {

        script = document.createElement('script');
        script.src = _.url(options);
        script.type = 'text/javascript';
        script.async = true;

        window[callback] = function (data) {
            body = data;
        };

        var handler = function (event) {

            delete window[callback];
            document.body.removeChild(script);

            if (event.type === 'load' && !body) {
                event.type = 'error';
            }

            response.ok = event.type !== 'error';
            response.status = response.ok ? 200 : 404;
            response.responseText = body ? body : event.type;
            response.headers = "";

            resolve(response);
        };

        script.onload = handler;
        script.onerror = handler;

        if (options.timeout) {
            setTimeout(function () {
                var response = {};

                response.ok = false;
                response.type = 'timeout';
                response.status = 0;
                response.responseText = '';
                response.header = function () {return null};

                resolve(response);

            }, options.timeout);
        }

        document.body.appendChild(script);
    });

};
