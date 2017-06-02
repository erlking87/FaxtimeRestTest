'use strict';

 var repository = require('../../../../lib/testAccountRepository');

 module.exports = {
     get: function TEST_ACCOUNT_GET(req, res) {
         repository.selectAccount(req, res);
     },
     post: function TEST_ACCOUNT_POST(req, res) {
         repository.createAccount(req, res);
     },
     put: function TEST_ACCOUNT_PUT(req, res) {
         repository.updateAccount(req, res);
     },
     delete: function TEST_ACCOUNT_DELETE(req, res) {
         repository.deleteAccount(req, res);
     }
 };
