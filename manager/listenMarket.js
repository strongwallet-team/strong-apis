
"use strict";
require('dotenv').config()
const Model           = require('../model/offer')
const VolumeModel           = require('../model/volume')
const moment           = require('moment')
const BigNumber = require('bignumber.js');
const rq            = require('request-promise')
const ABI = require('../utils/MARKET.json')
const BOOKKEEPERABI = require('../utils/BOOKKEEPERABI.json')
const COWCARDABI = require('../utils/COWCARDABI.json')
const Web3WsProvider = require('web3-providers-ws');
const Web3 = require('web3')

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
const web3 = new Web3(ws);

const contract = new web3.eth.Contract(ABI, process.env.MARKET_CONTRACT);
// console.log(process.env.MARKET_CONTRACT)
const cowCardcontract = new web3.eth.Contract(COWCARDABI, process.env.COWCARD_CONTRACT);
const getMetadataCowcard = (event) => {
    return cowCardcontract.methods.metadatas(event.returnValues.tokenId).call();
}
const getMetadata = (event) => {
    if(event.returnValues.nft.toLowerCase() == process.env.COWCARD_CONTRACT.toLowerCase()) return getMetadataCowcard(event)
    return -1
}
const handleEvNewOffer = async (event) => {
    const metadata = await getMetadata(event)
    const model = new Model({
        user: event.returnValues.user,
        txhash: event.transactionHash,
        nft: event.returnValues.nft,
        tokenId: event.returnValues.tokenId,
        price: event.returnValues.price,
        side: event.returnValues.side,
        id: event.returnValues.id,
        metadata
    })
    console.log(model)
    Model.findOneAndUpdate({
        user: event.returnValues.user,
        nft: event.returnValues.nft,
        tokenId: event.returnValues.tokenId,
        status: 0
    }, {$set: {status: 2, updatedAt: moment().unix()}}).then(rs => {
        return model.save()
    })

}
const getVolume = async (user) => {
    const bookKeeperContract = new web3.eth.Contract(BOOKKEEPERABI, process.env.BOOKKEPER_CONTRACT);
    const date = await bookKeeperContract.methods.getDate().call();
    const volume = await bookKeeperContract.methods.getVolume(user, date).call();
    const volumeEther = volume / 10**18
    const volumeModel = new VolumeModel({
        date,
        user,
        volume: volumeEther
    })
    volumeModel.save().catch(err => {
        if (typeof (err.code) != "undefined" && err.code == 11000) {
            VolumeModel.findOneAndUpdate({user, date}, {$set: {volume: volumeEther}}).then()
        }
        else console.log(err)
    })
}
const upsertVolume = async (id) => {
    const model = await Model.findOne({id})
    getVolume(model.user)
    getVolume(model.acceptUser)
}

const handleEvAcceptOffer = (event) => {
    // console.log(event)
    Model.findOneAndUpdate({
        id: event.returnValues.id,
        status: 0
    }, {
        $set: {
            acceptTxhash: event.transactionHash,
            acceptUser: event.returnValues.user,
            status: 1,
            updatedAt: moment().unix()
        }
    }).then(() => upsertVolume(event.returnValues.id))

}
const handleEvCancelOffer = (event) => {
    // console.log(event)
    Model.findOneAndUpdate({
        id: event.returnValues.id,
        status: 0
    }, {
        $set: {
            status: 2,
            updatedAt: moment().unix()
        }
    }).then()

}
const listen = () => {
    contract.events.allEvents().on('data', (event) => {
        // console.log(event)
        switch (event.event) {
            case 'EvNewOffer':
                handleEvNewOffer(event)
                break
            case 'EvAcceptOffer':
                handleEvAcceptOffer(event)
                break
            case 'EvCancelOffer':
                handleEvCancelOffer(event)
                break
            default:
                return -1
        }
    })
}
listen()
