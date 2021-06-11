
"use strict";
const BigNumber = require('bignumber.js');
const rq            = require('request-promise')
const PRESALEABI = require('../utils/PRESALEABI.json')
const Tx = require('ethereumjs-tx');
const Web3 = require('web3')
const Web3WsProvider = require('web3-providers-ws');
const Model = require('../model/Presale')

const options = {
    timeout: 30000, // ms

    clientConfig: {
        // Useful if requests are large
        maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
        maxReceivedMessageSize: 100000000, // bytes - default: 8MiB

        // Useful to keep a connection alive
        keepalive: true,
        keepaliveInterval: -1 // ms
    },
    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 1000, // ms
        maxAttempts: 10,
        onTimeout: false
    }
};

const ws = new Web3WsProvider(process.env.RPC_WS, options);
const web33 = new Web3(ws);
const run = () => {
    const contract = new web33.eth.Contract(PRESALEABI, process.env.PRESALE_CONTRACT)
    contract.events.allEvents().on('data', (event) => {

        if(['DepositETHWithSeller', 'DepositUSDTWithSeller'].includes(event.event)) {
            const data = {
                user: event.returnValues.receiver,
                txhash: event.transactionHash,
                seller: event.returnValues._seller,
                amountStrong: event.returnValues.amountStrong / 10**18,
                metaData: event,
            }
            const model = new Model(data)
            model.save()
        }
    })
}
// run()

module.exports = {
    get: () => {
        return Model.find()
    },
    getTop: () => {
        return new Promise((resolve, reject) => {
            Model.aggregate([{
                $group: {
                    _id: '$seller',
                    amountStrong: {$sum: '$amountStrong'},
                }
            }, {$sort: {amountStrong: -1}}], (err, rs) => {
                if (!err) {
                    return resolve(rs)
                }

            });
        })
    }
}


