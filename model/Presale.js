/**
 * Created by lamtanphiho on 5/19/2018.
 */
const mongoose  = require('mongoose');
mongoose.Promise = global.Promise;
const Schema 	= mongoose.Schema;
const moment = require('moment')
const schema    = new Schema({
    user: String,
    txhash: String,
    seller: String,
    amountStrong: Number,
    metaData: {},
    createdAt: String

});
schema.pre("save", function(next) {
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});
schema.index({ txhash: 1 }, { unique: true });
schema.index({ user: 1 });
schema.index({ seller: 1 });
schema.index({createdAt: 1});
module.exports = mongoose.model('seller', schema);