
"use strict";
const BigNumber = require('bignumber.js');
const rq            = require('request-promise')
const ABI = require('../utils/AIRDROPABI.json')
const ABIGOUDA = require('../utils/ABIGOUDA.json')
const Tx = require('ethereumjs-tx');
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC));
const web32 = new Web3(new Web3.providers.HttpProvider(process.env.RPC));
require('dotenv').config()

const account = process.env.AIRDROP_ACCOUNT
const key = process.env.AIRDROP_ACCOUNT_KEY
web3.eth.accounts.wallet.add(key)
web3.eth.defaultAccount = account

const account2 = process.env.AIRDROP_ACCOUNT2
const key2 = process.env.AIRDROP_ACCOUNT_KEY2
web32.eth.accounts.wallet.add(key2)
web32.eth.defaultAccount = account2

const airdropContract = '0x2c13bB2bF2D62AfE8A9086c4c19c459822C9088D'
const goudaContract = '0x14B06bF2C5B0AFd259c47c4be39cB9368ef0be3f'
const sendBNB = async () => {
    const newAccount = await web3.eth.accounts.create()
    // const newKey = Buffer.from('0x3de20faa3ed2c047bc2ad7b592aef2e4179b182544de51379c0d4f212b72616b'.replace('0x', ''), 'hex')
    const newKey = new Buffer(newAccount.privateKey.replace('0x', ''), 'hex')
    // transferToken('0xEB750C149E219F8028B38a34C8d13cabD5D230b0', newKey)
    return web3.eth.sendTransaction({to: newAccount.address, from: account, value: '651480000000000', gas: 21000}).then(rs => {
        console.log('send BNB', rs.transactionHash)
        // claim('0x4709E8e301183C577d8Dd753063E2C0a9B40dbe0', newKey)
        claim(newAccount.address, newKey)
        sendBNB()
    }).catch(sendBNB)
}

const sendBNB2 = async () => {
    const newAccount = await web3.eth.accounts.create()
    const newKey = new Buffer(newAccount.privateKey.replace('0x', ''), 'hex')
    return web32.eth.sendTransaction({to: newAccount.address, from: account2, value: '651480000000000', gas: 21000}).then(rs => {
        console.log('send BNB 2', rs.transactionHash)
        // claim('0x4709E8e301183C577d8Dd753063E2C0a9B40dbe0', newKey)
        claim(newAccount.address, newKey)
        sendBNB2()
    }).catch(sendBNB2)
}

const transferToken = async (address, newKey) => {
    const contract = new web3.eth.Contract(ABIGOUDA, goudaContract, {
        from: address,
    })
    const dataTx = contract.methods.transfer(account, '4999999999999999990').encodeABI();
    const nonce = await web3.eth.getTransactionCount(address);
    // console.log(nonce)
    const gasPrice = await web3.eth.getGasPrice();
    // console.log(gasPrice)
    const gasPriceHex = web3.utils.toHex(Math.round(gasPrice));
    const rawData = {
        nonce   : '0x' + nonce.toString(16),
        from: address,
        to: goudaContract,
        data:dataTx,
        gasPrice: gasPriceHex,
    }
    const gasLimit = await web3.eth.estimateGas(rawData)
    // console.log(gasLimit)
    rawData.gasLimit = web3.utils.toHex(gasLimit);

    const tx = new Tx(rawData);
    tx.sign(newKey);
    const serializedTx = tx.serialize();
    return web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', (rs) => {
        console.log('transfer GOUDA', rs.transactionHash)
    }).on('error', err => {
        console.log('transferToken', err)

    });
}
const claim = async (address, newKey) => {
    const contract = new web3.eth.Contract(ABI, airdropContract, {
        from: address,
    })
    const dataTx = contract.methods.claim().encodeABI();
    const nonce = await web3.eth.getTransactionCount(address);
    const gasPrice = await web3.eth.getGasPrice();
    // console.log(gasPrice)
    const gasPriceHex = web3.utils.toHex(Math.round(gasPrice));
    const rawData = {
        nonce   : '0x' + nonce.toString(16),
        from: address,
        to: airdropContract,
        data:dataTx,
        gasPrice: gasPriceHex,
    }
    const gasLimit = await web3.eth.estimateGas(rawData)
    // console.log(gasLimit)
    rawData.gasLimit = web3.utils.toHex(gasLimit);

    const tx = new Tx(rawData);
    tx.sign(newKey);
    const serializedTx = tx.serialize();
    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', (rs) => {
        console.log('claim GOUDA', address, rs.transactionHash)
        transferToken(address, newKey)
    }).on('error', err => {
        console.log(222, err)

    });
}


const run = async () => {
    sendBNB()
    sendBNB2()


}
// run()

const exportAddress = async () => {
    for(let i = 0; i < 100;) {
        const newAccount = await web3.eth.accounts.create()
        console.log('Cow ' + ++i, newAccount.address, newAccount.privateKey)
    }

}

exportAddress()