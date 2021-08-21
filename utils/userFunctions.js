/**
 * Created by A on 7/18/17.
 */
'use strict';

const Boom = require('boom');
const utils = require('ethereumjs-util');

const getNakedAddress = (address) => {
    return address.toLowerCase().replace('0x', '');
}

const verifyMEWSignature = (msg) => {
    // console.log(msg);

    const sig = new Buffer.from(getNakedAddress(msg.sig), 'hex');
    if (sig.length != 65) {
        return false;
    }
    sig[64] = sig[64] == 0 || sig[64] == 1 ? sig[64] + 27 : sig[64];
    const hash = msg.version=='2' || msg.version=='3' ? utils.hashPersonalMessage(utils.toBuffer(msg.msg)) : utils.sha3(msg.msg);
    const pubKey = utils.ecrecover(hash, sig[64], sig.slice(0, 32), sig.slice(32, 64));
    return getNakedAddress(msg.address) === utils.pubToAddress(pubKey).toString('hex');
}

const verifySignature = (req, res) => {
    const auth = req.headers.authorization;
    const authKeys = auth.split('|');
    if (authKeys.length != 2) res(Boom.badRequest('authorization.token.invalid'));
    const signature = {sig: authKeys[0], address: authKeys[1]};
    try {
        signature['version'] = 2;
        signature['msg'] = process.env.MESSAGE_HASH;
        const valid = verifyMEWSignature(signature);
        if (valid) {
            // return true;
            return res({valid}); // dummy return
        }
            res(Boom.badRequest('signature.invalid-1'));

    } catch (e) {
        res(Boom.badRequest('signature.invalid-2'));
    }
}


module.exports = {
    verifySignature
}