/**
 * Created by A on 7/18/17.
 */
'use strict';
const Manager                   = require('../manager/StrongPresale');
const Joi                       = require('joi');
const Response                  = require('./response').setup(Manager);

module.exports = {
    get : {
        tags: ['api', 'Presale'],
        description: 'Get Presale list',
        handler: (req, res) => {
            return Response(req, res, 'get');
        }
    },
    getTop : {
        tags: ['api', 'Presale'],
        description: 'Get Presale top',
        handler: (req, res) => {
            return Response(req, res, 'getTop');
        }
    },
}