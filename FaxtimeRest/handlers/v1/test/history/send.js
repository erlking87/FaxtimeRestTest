'use strict';

 var repository = require('../../../../lib/testHistoryRepository');

 module.exports = {
     get: function TEST_HISTORY_GET(req, res) {
         repository.selectHistory(req, res);
     },
     post: function TEST_HISTORY_POST(req, res) {
         repository.createHistory(req, res);
     }
 };
