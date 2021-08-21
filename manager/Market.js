
"use strict";

const Model = require('../model/offer')

module.exports = {
    get: (req) => {
        const options = {}
        const skip = req.query.skip || 0
        const limit = req.query.limit || 20
        const sort = req.query.sort || 'asc'
        if(req.query.user) options.user = req.query.user
        if(req.query.status) options.status = req.query.status
        if(req.query.fromDate && req.query.toDate) options.createdAt = {$gte: req.query.fromDate, $lte: req.query.toDate}
        return Model.find(options).limit(limit).skip(skip * limit).sort({
            createdAt: sort
        }).then(async rs => {
            const totalPage = await Model.countDocuments(options)
            return {
                totalPage: Math.ceil(totalPage / limit),
                data: rs
            }
        })
    }

}


