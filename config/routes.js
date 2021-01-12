'use strict';
const Presale = require('../route/Presale')
module.exports = [
    { method: 'GET', path: '/presales', config : Presale.get},
    { method: 'GET', path: '/presales/top', config : Presale.getTop},
]