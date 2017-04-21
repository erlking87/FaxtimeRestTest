'use strict';

 var repository = require('../../../../lib/faxtimeSmsRepository');

 module.exports = {
     get: function FAXTIME_SDK_SMS_RESULT_GET(req, res) {
         repository.selectSendResult(req, res);
     }
 };
