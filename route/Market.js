
const Joi                       = require('joi');
const Manager                   = require('../manager/Market');
const Response                  = require('./response').setup(Manager);

module.exports = {
    getTopPlayer: {
        tags: ['api', 'MARKET'],
        description: 'get top Player',
        handler: (req, res) => {
            Response(req, res, 'getTopPlayer');
        },
        // validate: {
        //     query: Joi.object({
        //         user: Joi.string(),
        //         nft: Joi.string(),
        //         status: Joi.string(),
        //         tokenId: Joi.string(),
        //         fromDate: Joi.string(),
        //         toDate: Joi.string(),
        //         limit: Joi.number().default(20),
        //         skip: Joi.number().default(0),
        //         sort: Joi.number().valid('desc', 'asc')
        //     })
        // },
    },
    get: {
        tags: ['api', 'MARKET'],
        description: 'get offers',
        handler: (req, res) => {
            Response(req, res, 'get');
        },
        validate: {
            query: Joi.object({
                user: Joi.string(),
                nft: Joi.string(),
                status: Joi.string(),
                tokenId: Joi.string(),
                fromDate: Joi.string(),
                toDate: Joi.string(),
                limit: Joi.number().default(20),
                skip: Joi.number().default(0),
                sort: Joi.number().valid('desc', 'asc')
            })
        },
    }
}