'use strict';
var Mockgen = require('../../../mockgen.js');
/**
 * Operations on /result
 */
module.exports = {
    /**
     * summary: 
     * description: 
     * parameters: 
     * produces: application/json, text/json
     * responses: 200
     * operationId: result_get
     */
    get: {
        200: function (req, res, callback) {
            /**
             * Using mock data generator module.
             * Replace this by actual data for the api.
             */
            Mockgen().responses({
                path: '/v1/faxtime/sms/result',
                operation: 'get',
                response: '200'
            }, callback);
        }
    }
};
