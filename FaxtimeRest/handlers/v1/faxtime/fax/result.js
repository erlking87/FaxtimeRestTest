'use strict';

 var repository = require('../../../../lib/faxtimeFaxRepository');

 module.exports = {
     get: function FAXTIME_FC_FAX_RESULT_GET(req, res) {
         repository.selectSendResult(req, res);
     }
 };
