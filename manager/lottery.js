
"use strict";
const CronJob           = require('cron').CronJob;
const moment           = require('moment')
const BigNumber = require('bignumber.js');
const rq            = require('request-promise')
const ABI = require('../utils/ABILOTTERY.json')
const Tx = require('ethereumjs-tx');
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC));
require('dotenv').config()

const account = process.env.OPERATOR
const key = process.env.OPERATOR_KEY
web3.eth.accounts.wallet.add(key)
web3.eth.defaultAccount = account

const contract = new web3.eth.Contract(ABI, process.env.LOTTERY_CONTRACT);
const drawFinalNumberAndMakeLotteryClaimable = async (currentLotteryId, autoInjection) => {
    const drawFinalNumberAndMakeLotteryClaimable = contract.methods.drawFinalNumberAndMakeLotteryClaimable(currentLotteryId, autoInjection)
    const gasPrice = await web3.eth.getGasPrice();
    try {
        drawFinalNumberAndMakeLotteryClaimable.estimateGas({from: account}).then(async gasLimit => {
            await drawFinalNumberAndMakeLotteryClaimable.send({
                from: account,
                gasLimit : gasLimit,
                gasPrice: gasPrice
            }).on('receipt', (hash) => {
                console.log('drawFinalNumberAndMakeLotteryClaimable', hash.transactionHash);

            }).catch(err => console.log('err create hash', err))
        }).catch(console.error);

    } catch (e) {
        console.log('err handle bot', e)
    }
}
const closeLottery = async (currentLotteryId) => {
    const closeLottery = contract.methods.closeLottery(currentLotteryId)
    const gasPrice = await web3.eth.getGasPrice();
    try {
        closeLottery.estimateGas({from: account}).then(async gasLimit => {
            await closeLottery.send({
                from: account,
                gasLimit : gasLimit,
                gasPrice: gasPrice
            }).on('receipt', (hash) => {
                console.log('closeLottery', hash.transactionHash);

            }).catch(err => console.log('err create hash', err))
        }).catch(console.error);

    } catch (e) {
        console.log('err handle bot', e)
    }
}
const startLottery = async () => {
    const endtime = Number(moment().unix()) + process.env.MIN_LENGTH_LOTTERY
    const priceTicketInGouda = process.env.PRICE_TICKET_IN_GOUDA
    const discountDivisor = process.env.DISCOUNT_DIVISOR
    const rewardsBreakdown = [125,375,750,1250,2500,5000]
    const treasuryFee = process.env.TREA_SURY_FEE
    const startLottery = contract.methods.startLottery(endtime, priceTicketInGouda, discountDivisor, rewardsBreakdown, treasuryFee)
    const gasPrice = await web3.eth.getGasPrice();
    try {
        startLottery.estimateGas({from: account}).then(async gasLimit => {
            await startLottery.send({
                from: account,
                gasLimit : gasLimit,
                gasPrice: gasPrice
            }).on('receipt', (hash) => {
                console.log('startLottery', hash.transactionHash);

            }).catch(err => console.log('err create hash', err))
        }).catch(console.error);

    } catch (e) {
        console.log('err handle bot', e)
    }
}
const handler = async () => {

    const currentLotteryId = await contract.methods.viewCurrentLotteryId().call()
    const [lottery] = await Promise.all([contract.methods.viewLottery(currentLotteryId).call()])
    if(lottery.status == 3) startLottery()
    if(lottery.status == 1 && Number(lottery.endTime) < (moment().unix())) closeLottery(currentLotteryId)
    if(lottery.status == 2) drawFinalNumberAndMakeLotteryClaimable(currentLotteryId, true)
}
const cronjob = new CronJob('*/10 * * * * *', () => {
    handler()
})
cronjob.start()