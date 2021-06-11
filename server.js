/**
 * Created by A on 7/18/17.
 */
'use strict'
global.__TTL_DB_SYNC = 8640000; // 100 ngay
global.userManagement = []

require('dotenv').config()
const Logger    = require('./utils/logging');
const Glue      = require('glue');
const AppConfig = require('./config/app');
const mongoose  = require('mongoose');
const dbUrl     = require('./config/mongodb');
const Routes = require('./config/routes');
const Manifest  = require('./config/manifest');
require('./manager/cronjob');

Glue.compose(Manifest, {relativeTo: __dirname}, (err, server) => {
    if (err) {
        throw err;
    }
    server.start(() => {
        Logger.info('Server running at:', server.info.uri);
        mongoose.connection.openUri(dbUrl.connectString,  { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
            if(err) Logger.error("Can't connect to MongoDB !!!");
            else Logger.info("Connect MongoDB success !!!");
        });
    });
    server.route(Routes);
    server.auth.strategy('jwt', 'jwt', {
        key: AppConfig.jwt.secret,
        verifyOptions: { algorithms: ['HS256'] }
    });

});