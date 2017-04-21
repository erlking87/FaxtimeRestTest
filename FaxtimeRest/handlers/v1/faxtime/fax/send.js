'use strict';

var repository = require('../../../../lib/faxtimeFaxRepository');

module.exports = {
     get: function FAXTIME_FC_FAX_SEND_GET(req, res) {
         repository.selectSendMsg(req, res);
     },
     post: function FAXTIME_FC_FAX_SEND_POST(req, res) {
         repository.createSendMsg(req, res);
     },
     put: function FAXTIME_FC_FAX_SEND_PUT(req, res) {
         repository.updateSendMsg(req, res);
     },
     delete: function FAXTIME_FC_FAX_SEND_DELETE(req, res) {
         repository.deleteSendMsg(req, res);
     }
 };
