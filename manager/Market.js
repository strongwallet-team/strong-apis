
"use strict";

const Model = require('../model/offer')
const VolumeModel           = require('../model/volume')

module.exports = {
    getTopPlayer: (req) => {
        const query = [{
                $group: {
                    _id: {user: '$user'},
                    volume: {$sum: '$volume'},
                }
            },
            { $sort : { volume : -1 } },
            { $limit : 10 }]
        return new Promise((resolve, reject) => {
            VolumeModel.aggregate(query, (err, rs) => {
                // console.log(rs)
                if (!err) {
                    return resolve(rs)
                }

            });
        })
    },
    get: (req) => {
        const options = {}
        const skip = req.query.skip || 0
        const limit = req.query.limit || 20
        const sort = req.query.sort || 'desc'
        if(req.query.user) options.user = req.query.user
        if(req.query.nft) options.nft = req.query.nft
        if(req.query.status) options.status = req.query.status
        if(req.query.tokenId) options.tokenId = req.query.tokenId
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


