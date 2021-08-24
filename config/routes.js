'use strict';

const Market = require('../route/Market')

module.exports = [
    { method: 'GET', path: '/market/offer', config : Market.get},
    { method: 'GET', path: '/market/top-player', config : Market.getTopPlayer},
]