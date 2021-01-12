'use strict';
const Logger = require('../utils/logging');
const errorCodes = {
    405: {statusCode: 405, error: 'Method Not Allowed', message: 'An invalid operation occurred'},
    500: {statusCode: 500, error: 'Internal Server Error', message: 'An internal server error occurred'},
    200: {statusCode: 200, error: null, message: 'Success', data: null},
    201: {statusCode: 201, error: null, message: 'Create Success !!!', data: null},
};

module.exports = {
    setup: function(manager) {
        return function(request, reply, method) {
            return manager[method](request).then((data) => {
                if (data && data.statusCode) return reply.response(data).code(data.statusCode);
                return reply.response(data).code(200);
            }).catch((data) => {
                Logger.error(data);
                if (data && data.statusCode) return reply.response(data).code(data.statusCode);

                return reply.response(data).code(errorCodes['500']);

            });
        };
    },
};