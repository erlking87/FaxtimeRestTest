'use strict';

 var repository = require('../../../../lib/faxtimeMmsRepository');

 module.exports = {
     get: function FAXTIME_SDK_MMS_RESULT_GET(req, res) {
         repository.selectSendResult(req, res);
     }
 };
