/**
 * Created by lamtanphiho on 5/19/2018.
 */
const mongoose  = require('mongoose');
mongoose.Promise = global.Promise;
const Schema 	= mongoose.Schema;
const moment = require('moment')
const schema    = new Schema({
    user: String,
    volume: Number,
    date: Number,
    createdAt: String,
    updatedAt: Number

});
schema.pre("save", function(next) {
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});
schema.index({ user: 1, date: 1 }, { unique: true });
schema.index({createdAt: 1});
module.exports = mongoose.model('volume', schema);