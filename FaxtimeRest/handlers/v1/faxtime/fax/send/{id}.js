'use strict';

var repository = require('../../../../../lib/faxtimeFaxRepository');

module.exports = {
     get: function FAXTIME_FC_FAX_SEND_GETBYID(req, res) {
         repository.selectSendMsg(req, res, req.params['id']);
     },
     put: function FAXTIME_FC_FAX_SEND_PUTBYID(req, res) {
         repository.updateSendMsg(req, res, req.params['id']);
     },
     delete: function FAXTIME_FC_FAX_SEND_DELETEBYID(req, res) {
         repository.deleteSendMsg(req, res, req.params['id']);
     }
 };
