'use strict';

var dbHelper = require('./dbHelper');
var dbConfig = require('./dbConfig');
var sql = require('mssql');

// 쿼리에 널처리 한다.

module.exports = {
    // 스웨거 스팩상 라우터에서 패스 파라미터는 단일항목만 지원함
    selectHistory: function (req, res) {
        var sqlText = 
            "select sid, userid, getpoint, maxpoint, evgpoint, result, convert(varchar(5), dbo.getLocalDate(DEFAULT), 101) as date from test_history where userid = '" + req.query['user'] + "' order by sid desc;";
        return dbHelper.sqlSelect(sqlText, res);
    },
    createHistory: function (req, res) {
        // id 즉 패스 파라미터 형식은 지원하지 않는다.
        // 전문본문에 데이터가 없다면 잘못된 요청이다.
        if(!req.body instanceof Array ) {
            return res.send({
                "status" : "400",
                "description" : "잘못된 요청"
            });
        }
        
        var sqlText = [];
        for (var i = 0; i < req.body.length; i++) {
            sqlText.push(
                "insert into test_history(\n"
                + "userid, getpoint, maxpoint, evgpoint, result, date)\n"
                + "values( '" + req.body[i]['userid'] + "', '" + req.body[i]['getpoint'] + "', '"
                + req.body[i]['maxpoint'] + "', '" + req.body[i]['evgpoint'] + "', '"
                + req.body[i]['result'] + "', dbo.getLocalDate(DEFAULT) )"
            );
        }

        return dbHelper.sqlExecute(sqlText, res);

    },
    updateAccount: function (req, res) {

        // 일괄업데이트 즉 id 가 없는것은 지원하지 않는다.
        // 즉 단건도 아니고, 본문(항목명세)도 없다.
        if((typeof id === 'undefined' || null == id)
            && (!req.body instanceof Array)) {
            return res.send({
                "status" : "403",
                "description" : "금지됨"
            });
        }

        var sqlText = [];
        var agentKey = req.get("Agent-Key") || "";
        if(typeof id !== 'undefined' && null != id) {
            sqlText.push(
                "  UPDATE A SET \n"
                + "       NOW_DATE = CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 112) + REPLACE(CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 108), ':', '') \n"
                + "       , SEND_DATE = (case when '" + req.body['chkReserve'] + "'='T' then REPLACE(REPLACE(REPLACE('" + req.body['revDttm'] + "','-',''), ' ',''),':','') else CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 112) + REPLACE(CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 108), ':', '') end ) \n"
                + "       , SCHEDULE_TYPE = case when '" + req.body['chkReserve'] + "'='T' then '1' else '0' end \n"
                + "       , SUBJECT = '" + req.body['sTitle'] + "' \n"
                + "       , SMS_MSG = '" + req.body['vmessage'] + "' \n"
                + "       , CALLBACK = '" + req.body['vsourcetel'] + "' \n"
                + "       , DEST_INFO = '" + req.body['vreceiver'] + "^" + req.body['vdestinationtel'] + "' \n"
                + "  FROM SDK_SMS_SEND AS A \n"
                + " INNER JOIN TBL_RESTAPI_USER AS B \n"
                + "    ON A.USER_ID = B.NSID \n"
                + " WHERE A.MSG_ID = '" + id + "' \n"
                + "   AND B.AGENTID = '" + agentKey + "' \n"
                + ((null == req.body["user"]) ? "" : ("   AND B.VUSERID='" + req.body["user"] +"' \n"))
            );
        // 단건이 아니면 여러건이다.
        } else {
            var idx = 0; while(idx < req.body.length) {
                sqlText.push(
                "  UPDATE A SET "
                + "       NOW_DATE = CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 112) + REPLACE(CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 108), ':', '') "
                + "       , SEND_DATE = (case when '" + req.body[idx]['chkReserve'] + "'='T' then REPLACE(REPLACE(REPLACE('" + req.body[idx]['revDttm'] + "','-',''), ' ',''),':','') else CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 112) + REPLACE(CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 108), ':', '') end ) "
                + "       , SCHEDULE_TYPE = case when '" + req.body[idx]['chkReserve'] + "'='T' then '1' else '0' end "
                + "       , SUBJECT = '" + req.body[idx]['sTitle'] + "' "
                + "       , SMS_MSG = '" + req.body[idx]['vmessage'] + "' "
                + "       , CALLBACK = '" + req.body[idx]['vsourcetel'] + "' "
                + "       , DEST_INFO = '" + req.body[idx]['vreceiver'] + "^" + req.body[idx]['vdestinationtel'] + "' "
                + "  FROM SDK_SMS_SEND AS A \n"
                + " INNER JOIN TBL_RESTAPI_USER AS B \n"
                + "    ON A.USER_ID = B.NSID \n"
                + " WHERE A.MSG_ID = '" + req.body[idx]["id"] + "' \n"
                + "   AND B.AGENTID = '" + agentKey + "' \n"
                + ((null == req.body[idx]["user"]) ? "" : ("   AND B.VUSERID='" + req.body[idx]["user"] +"' \n"))
                );
                ++idx
            }
        }
        return dbHelper.sqlExecute(sqlText, res, id);
    },
    deleteAccount: function (req, res) {
        
        // 일괄업데이트 즉 id 가 없는것은 지원하지 않는다.
        // 즉 단건도 아니고, 본문(항목명세)도 없다.
        if((typeof id === 'undefined' || null == id)
            && (!req.body instanceof Array)) {
            return res.send({
                "status" : "403",
                "description" : "금지됨"
            });
        }
        
        var sqlText = []; // object or array
        var agentKey = req.get("Agent-Key") || "";
        // id가 있으면 본문은 단건에 대한 오브젝트이다.
        if(typeof id !== 'undefined' && null != id) {
            sqlText.push(
                "  UPDATE A SET \n"
                + "       A.NBALANCE=(A.NBALANCE + B.RESERVED8) \n"
                + "  FROM TBLUSER A \n"
                + " INNER JOIN SDK_SMS_SEND B \n"
                + "    ON A.NSID=B.USER_ID \n"
                + " WHERE B.MSG_ID=" + id
            );
            sqlText.push(
                "  DELETE A \n"
                + "  FROM SDK_SMS_SEND AS A \n"
                + " INNER JOIN TBL_RESTAPI_USER AS B \n"
                + "    ON A.USER_ID = B.NSID \n"
                + " WHERE A.MSG_ID = '" + id + "' \n"
                + "   AND B.AGENTID = '" + agentKey + "' \n"
                + ((null == req.body["user"]) ? "" : ("   AND B.VUSERID='" + req.body["user"] +"' \n"))
            );
        } else {
            var idx = 0; while(idx < req.body.length) {
                sqlText.push(
                "  UPDATE A SET \n"
                + "       A.NBALANCE=(A.NBALANCE + B.RESERVED8) \n"
                + "  FROM TBLUSER A \n"
                + " INNER JOIN SDK_SMS_SEND B \n"
                + "    ON A.NSID=B.USER_ID \n"
                + " WHERE B.MSG_ID=" + req.body[idx]["id"]
                );
                sqlText.push(
                "  DELETE A \n"
                + "  FROM SDK_SMS_SEND AS A \n"
                + " INNER JOIN TBL_RESTAPI_USER AS B \n"
                + "    ON A.USER_ID = B.NSID \n"
                + " WHERE A.MSG_ID = '" + req.body[idx]["id"] + "' \n"
                + "   AND B.AGENTID = '" + agentKey + "' \n"
                + ((null == req.body[idx]["user"]) ? "" : ("   AND B.VUSERID='" + req.body[idx]["user"] +"' \n"))
                );
                ++idx
            }
        }
        
        return dbHelper.sqlExecute(sqlText, res);
    }
};