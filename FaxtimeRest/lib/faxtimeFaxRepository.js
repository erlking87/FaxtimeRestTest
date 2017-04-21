'use strict';

var dbHelper = require('./dbHelper');
// 계층형 쿼리는 직접처리함
var dbConfig = require('./dbConfig');
var sql = require('mssql');
// 쿼리에 널처리 한다.

module.exports = {
    // 스웨거 스팩상 라우터에서 패스 파라미터는 단일항목만 지원함
    selectSendMsg: function (req, res, id) {
        var args = dbHelper.sqlSelectParameters(req);
        var sqlText = 
            "  WITH ORDERD_DATA AS ( \n"
            + "    SELECT RANK() OVER(ORDER BY TR_BATCHID DESC) ROWID \n"
            + "           ,TR_BATCHID id \n"
            + "           ,TR_ID ntblusersid \n"
		        + "           ,TR_TITLE sTitle \n"
    		    + "           ,TR_MSGCOUNT msgCnt \n"
    		    + "           ,TR_SENDDATE revDttm \n"
    		    + "           ,TR_SENDNAME \n"
    		    + "           ,TR_SENDFAXNUM senderPh \n"
    		    + "           ,TR_DOCNAME fFileName \n"
    		    + "           ,TR_SENDSTAT cstatus \n"
    		    + "           ,TR_DOCSIZE fFileSize \n"
    		    + "           ,TR_DOCPAGE fFilePageCnt \n"
    		    + "           ,TR_CHARGE msgAmt \n"
    		    + "           ,TR_SMSYN smsyn \n"
            + "           ,TR_EMAILYN emailyn \n"
            + "           ,TR_EMAIL receiver \n"
            + "           ,TR_SMSNUM vsourcetel \n"
            + "           ,SENDING_MASS sendingmass \n"
            + "           , " + args["currentPage"] + " CURRENT_PAGE \n"
            + "           , COUNT(*) OVER() TOTAL_COUNT \n"            
            + "  FROM FC_META_TRAN \n"
            + " WHERE TR_ID in ( \n"
            + "     SELECT NSID  \n"
            + "	      FROM TBL_RESTAPI_USER \n"
            + "	     WHERE AGENTID = '" + args["agentKey"] + "' \n";
        if(null != args["user"]) {
            sqlText = sqlText
            + "        AND VUSERID='" + args["user"] +"' \n";
        }
            sqlText = sqlText
            + "   ) \n";
        if(typeof id !== 'undefined' && null != id) {
            sqlText = sqlText
            + "   AND MSG_ID='" + id +"' \n";
        }
            sqlText = sqlText
            + ")  \n"
            + "SELECT A.id \n"
            + "       ,A.ntblusersid \n"
            + "       ,TR_SENDNAME \"user\" \n"
            + "       ,A.sTitle \n"
            + "       ,A.revDttm \n"
            + "       ,A.msgCnt \n"
            + "       ,A.senderPh \n"
            + "       ,A.fFileName \n"
            + "       ,A.vsourcetel \n"
            + "       ,A.cstatus \n"
            + "       ,A.fFileSize \n"
            + "       ,A.fFilePageCnt \n"
            + "       ,A.msgAmt \n"
            + "       ,A.smsyn \n"
            + "       ,A.emailyn \n"
            + "       ,A.receiver \n"
            + "       ,A.sendingmass \n"
            + "       ,A.CURRENT_PAGE currentPage \n"
            + "       ,A.TOTAL_COUNT totalCount \n"
            + "       , ((TOTAL_COUNT / " + args["pageSize"] + ") + \n"
            + "           (CASE WHEN 0 < (TOTAL_COUNT % " + args["pageSize"] + ") THEN \n"
            + "                  1 \n"
            + "              ELSE 0 END)) AS totalPage \n"
            + "  FROM ORDERD_DATA A  \n"
            + " WHERE ROWID BETWEEN " + args["startIndex"] + " AND " + args["endIndex"] + "\n";
        
        // 쿼리
        /*var sqlText = 
            "  SELECT TR_BATCHID id \n"
            + "       , TR_SENDDATE revDttm \n"
            + "       , TR_ID ntblusersid \n"
            + "       , TR_TITLE sTitle \n"
            + "       , TR_MSGCOUNT msgCnt \n"
            + "       , TR_SENDNAME userid \n"
            + "       , TR_SENDFAXNUM senderPh \n"
            + "       , TR_DOCNAME fFileName \n"
            + "       , TR_SENDSTAT sendStat \n"
            + "       , TR_DOCSIZE fFileSize \n"
            + "       , TR_DOCPAGE fFilePageCnt \n"
            + "       , TR_CHARGE msgAmt \n"
            + "       , TR_SMSYN chkResultSms \n"
            + "       , TR_EMAILYN chkResultEmail \n"
            + "       , TR_EMAIL vemail \n"
            + "       , TR_SMSNUM vsourcetel \n"
            + "       , SENDING_MASS sendingMassId \n"
            + "  FROM FC_META_TRAN \n"
            + " WHERE NOT TR_SENDSTAT = '2' \n";
        if(typeof id !== 'undefined' && null != id) {
            sqlText = sqlText
            + "   AND TR_BATCHID='" + id +"'";
        }*/
        
        const pool = new sql.ConnectionPool(dbConfig, err => {
            const request = pool.request();
            var datas = null;
            function done() {
                return res.send({
                    "status" : "200",
                    "description" : "성공",
                    "affected" : (!datas instanceof Array ? 1 : datas.length),
                    "datas" : datas
                });
            }
            function clone(o) {
                var ret = {};
                Object.keys(o).forEach(function (val) {
                    ret[val] = o[val];
                });
                return ret;
            }
            var nextItem = function(i) {
                // 예외처리
                if(null == datas) {
                    return res.send({
                        "status" : "500",
                        "description" : "내부 서버 오류"
                    });
                }
                // 처리완료
                if((0 < i && !datas instanceof Array)
                    || (i >= datas.length)) {
                    // All done
                    done();
                    return;
                } else {
                    var row = (datas instanceof Array) ? datas[i] : datas;
                    var sqlQuery = 
                        "  SELECT TR_BATCHID batchId \n"
                        + "       , TR_SERIALNO serialNo \n"
                        + "       , TR_SENDDATE revDttm \n"
                        + "       , TR_NAME sRName \n"
                        + "       , TR_PHONE sFaxNo \n"
                        + "       , TR_SMSYN chkResultSms \n"
                        + "       , TR_SENDSTAT sendStat \n"
                        + "       , TR_RSLTSTAT rsltStat \n"
                        + "       , TR_NCHARGE fcNcharge \n"
                        + "  FROM FC_MSG_TRAN \n"
                        + " WHERE TR_BATCHID=" + row.id
                    ;
                    request.query(sqlQuery, (err, result) => {
                        if(typeof err !== 'undefined' && null != err) {
                            return res.send({
                                "status" : "500",
                                "description" : "내부 서버 오류"
                            });
                        }
    
                        try {
                            row.target = (typeof result === "undefined" || null == result
                                || typeof result.recordsets == 'undefined' || null == result.recordsets
                                || 1 > result.recordsets.length) ? [] : result.recordsets[0].slice();
                        }
                        catch (exception) {
                        	  console.log(exception);
                        }
                        
                        nextItem(i + 1);
                    });
                }
            }
            dbHelper.sqlLogWriter(sqlText);
            request.query(sqlText, (err, result) => {
                // 에러인 경우 빈객체로 리턴한다.
                if(typeof err !== 'undefined' && null != err) {
                    return res.send({
                            "status" : "500",
                            "description" : "내부 서버 오류"
                    });
                }
                
                if(0 == result.rowsAffected[0]) {
                  return res.send({
                      "status" : "204",
                      "description" : "콘텐츠 없음"
                  });
                }
                
                if(typeof id !== 'undefined' && null != id) {
                    datas = (0 < result.rowsAffected[0]) ? clone(result.recordset[0]) : null;
                } else {
                    datas = (0 < result.rowsAffected[0]) ? result.recordsets[0].slice() : [];
                }
                nextItem(0);
            });
        });
        pool.on('error', err => {
            return res.send({
                "status" : "500",
                "description" : "내부 서버 오류"
            });
        });
    },
    createSendMsg: function (req, res) {
        // id 즉 패스 파라미터 형식은 지원하지 않는다.
        // 전문본문에 데이터가 없다면 잘못된 요청이다.
        
        // FC_META_TRAN 
        //     TR_SENDSTAT 
        //         '-' >> 데이터등록
        //         0   >> 발송대기
        
        // 마스터 등록 > 수신자등록 > 마스터 수신대기로 변경
        
        
        if(!req.body instanceof Array ) {
            return res.send({
                "status" : "400",
                "description" : "잘못된 요청"
            });
        }
        
        var sqlText = [];
        var idx = 0; while(idx < req.body.length) {
            sqlText.push(
                "  INSERT INTO SDK_SMS_SEND ( "
                + "  MSG_ID, USER_ID, SCHEDULE_TYPE, "
                + "  SUBJECT, SMS_MSG, NOW_DATE, "
                + "  SEND_DATE, CALLBACK, DEST_INFO, "
                + "  RESERVED7, RESERVED8, RESERVED9 "
                + ") VALUES ( "
                + "  next value for dbo.seqsmsdata "               // id
                + "  , '" + req.body[idx]['ntblusersid'] + "'"
                + "  , '0' "
                + "  , '" + req.body[idx]['sTitle'] + "' "
                + "  , '" + req.body[idx]['vmessage'] + "' "
                + "  , CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 112) + REPLACE(CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 108), ':', '') "
                + "  , CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 112) + REPLACE(CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 108), ':', '') "
                + "  , '07044719788'"
                + "  , 'faxwide^" + req.body[idx]['vdestinationtel'] + "'"
                + "  , next value for dbo.seqsmsheader "
                + "  , (select isnull(( "
                + "     select isnull(nrate,0) "
                + "        from tblinternalrate tir, tbluser tu "
                + "       where tir.vclass = tu.vsmsclass "
                + "         and tir.ckind = 'S' "
                + "         and tu.nsid = '" + req.body[idx]['ntblusersid'] + "'"
                + "      ),0)) "
                + "  , 'F' "
                + "  ) ;"
            );
            ++idx
        }
        
        return dbHelper.sqlExecute(sqlText, res);
    },
    updateSendMsg: function (req, res, id) {

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
        // id가 있으면 본문은 단건에 대한 오브젝트이다.
        if(typeof id !== 'undefined' && null != id) {
            sqlText.push(
                "  UPDATE SDK_SMS_SEND SET "
                + "  NOW_DATE = CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 112) + REPLACE(CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 108), ':', '') "
                + "  , SEND_DATE = (case when '" + req.body['chkReserve'] + "'='T' then REPLACE(REPLACE(REPLACE('" + req.body['chkReserve'] + "','-',''), ' ',''),':','') else CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 112) + REPLACE(CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 108), ':', '') end ) "
                + "  , SCHEDULE_TYPE = case when '" + req.body['chkReserve'] + "'='T' then '1' else '0' end "
                + "  , SUBJECT = '" + req.body['sTitle'] + "' "
                + "  , SMS_MSG = '" + req.body['vmessage'] + "' "
                + "  , CALLBACK = '" + req.body['vsourcetel'] + "' "
                + "  , DEST_INFO = '" + req.body['vreceiver'] + "^" + req.body['vdestinationtel'] + "' "
                + " WHERE MSG_ID = '" + id + "'"
            );
        // 단건이 아니면 여러건이다.
        } else {
            var idx = 0; while(idx < req.body.length) {
                sqlText.push(
                    "  UPDATE SDK_SMS_SEND SET "
                + "  NOW_DATE = CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 112) + REPLACE(CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 108), ':', '') "
                + "  , SEND_DATE = (case when '" + req.body[idx]['chkReserve'] + "'='T' then REPLACE(REPLACE(REPLACE('" + req.body[idx]['chkReserve'] + "','-',''), ' ',''),':','') else CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 112) + REPLACE(CONVERT(CHAR(8), dbo.getLocalDate(DEFAULT), 108), ':', '') end ) "
                + "  , SCHEDULE_TYPE = case when '" + req.body[idx]['chkReserve'] + "'='T' then '1' else '0' end "
                + "  , SUBJECT = '" + req.body[idx]['sTitle'] + "' "
                + "  , SMS_MSG = '" + req.body[idx]['vmessage'] + "' "
                + "  , CALLBACK = '" + req.body[idx]['vsourcetel'] + "' "
                + "  , DEST_INFO = '" + req.body[idx]['vreceiver'] + "^" + req.body[idx]['vdestinationtel'] + "' "
                + " WHERE MSG_ID = '" + req.body[idx]["id"] + "';"
                );
                ++idx
            }
        }
        
        return dbHelper.sqlExecute(sqlText, res, id);
    },
    deleteSendMsg: function (req, res, id) {
        
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
        // id가 있으면 본문은 단건에 대한 오브젝트이다.
        if(typeof id !== 'undefined' && null != id) {
            sqlText.push(
                "  DELETE FROM SDK_SMS_SEND "
                + " WHERE MSG_ID = '" + id + "'"
            );
        } else {
            var idx = 0; while(idx < req.body.length) {
                sqlText.push(
                "  DELETE FROM SDK_SMS_SEND "
                + " WHERE MSG_ID = '" + req.body[idx]["id"] + "';"
                );
                ++idx
            }
        }
        
        return dbHelper.sqlExecute(sqlText, res, id);
    },
    selectSendResult: function (req, res) {
        var args = dbHelper.sqlSelectParameters(req);
        var id = (typeof req.query !== "undefined") ? req.query["id"] : null;
        var sqlText = 
            "  WITH ORDERD_DATA AS ( \n"
            + "    SELECT RANK() OVER(ORDER BY MSG_ID DESC) ROWID \n"
            + "           , MSG_ID id \n"
            + "           , USER_ID ntblusersid \n"
            + "           , JOB_ID \n"
            + "           , CASE SCHEDULE_TYPE WHEN 1 THEN 'T' ELSE 'F' END chkReserve \n"
            + "           , SUBJECT sTitle \n"
            + "           , MMS_MSG vmessage \n"
            + "           , SEND_DATE revDttm \n"
            + "           , CALLBACK vsourcetel \n"
            + "           , SUBSTRING(CONVERT(VARCHAR,DEST_INFO), 0, CHARINDEX('^', DEST_INFO)) vreceiver \n"
            + "           , SUBSTRING(CONVERT(VARCHAR,DEST_INFO), CHARINDEX('^', DEST_INFO) + 1, LEN(CONVERT(VARCHAR,DEST_INFO)) - CHARINDEX('^', DEST_INFO)) vdestinationtel \n"
            + "           , CONTENT_COUNT file_cnt \n"
            + "           , CONTENT_DATA file_path \n"
            + "           , RESERVED8 msgRate \n"
            + "           , SUCC_COUNT \n"
            + "           , FAIL_COUNT \n"
            + "           , " + args["currentPage"] + " CURRENT_PAGE \n"
            + "           , COUNT(*) OVER() TOTAL_COUNT \n"     
            + "      FROM SDK_MMS_REPORT \n"
            + "     WHERE USER_ID in ( \n"
            + "         SELECT NSID  \n"
            + "	          FROM TBL_RESTAPI_USER \n"
            + "	         WHERE AGENTID = '" + args["agentKey"] + "' \n";
        if(null != args["user"]) {
            sqlText = sqlText
            + "            AND VUSERID='" + args["user"] +"' \n";
        }
            sqlText = sqlText
            + "       ) \n";
        if(typeof id !== 'undefined' && null != id) {
            sqlText = sqlText
            + "   AND MSG_ID='" + id +"' \n";
        }
            sqlText = sqlText
            + ")  \n"
            + "SELECT A.id \n"
            + "       ,A.ntblusersid \n"
            + "       ,(SELECT VUSERID FROM TBL_RESTAPI_USER WHERE NSID=A.ntblusersid) \"user\" \n"
            + "       ,A.chkReserve \n"
            + "       ,A.sTitle \n"
            + "       ,A.vmessage \n"
            + "       ,A.revDttm \n"
            + "       ,A.vreceiver \n"
            + "       ,A.vdestinationtel \n"
            + "	      ,A.vsourcetel \n"
            + "	      ,A.msgRate "
            + "	      ,A.SUCC_COUNT succCount "
            + "	      ,A.FAIL_COUNT FailCount "
            + "       ,A.file_cnt \n"
            + "       ,A.file_path \n"
            + "       ,A.CURRENT_PAGE currentPage \n"
            + "       ,A.TOTAL_COUNT totalCount \n"
            + "       , ((TOTAL_COUNT / " + args["pageSize"] + ") + \n"
            + "           (CASE WHEN 0 < (TOTAL_COUNT % " + args["pageSize"] + ") THEN \n"
            + "                  1 \n"
            + "              ELSE 0 END)) AS totalPage \n"
            + "  FROM ORDERD_DATA A  \n"
            + " WHERE ROWID BETWEEN " + args["startIndex"] + " AND " + args["endIndex"] + "\n";
        
        const pool = new sql.ConnectionPool(dbConfig, err => {
            const request = pool.request();
            var datas = null;
            function done() {
                return res.send({
                    "status" : "200",
                    "description" : "성공",
                    "affected" : (!datas instanceof Array ? 1 : datas.length),
                    "datas" : datas
                });
            }
            function clone(o) {
                var ret = {};
                Object.keys(o).forEach(function (val) {
                    ret[val] = o[val];
                });
                return ret;
            }
            var nextItem = function(i) {
                // 예외처리
                if(null == datas) {
                    return res.send({
                        "status" : "500",
                        "description" : "내부 서버 오류"
                    });
                }
                // 처리완료
                if((0 < i && !datas instanceof Array)
                    || (i >= datas.length)) {
                    // All done
                    done();
                    return;
                } else {
                    var row = (datas instanceof Array) ? datas[i] : datas;
                    var sqlQuery = 
                        "  SELECT SEND_DATE revDttm \n"
                        + "       , DEST_NAME \n"
                        + "       , PHONE_NUMBER \n"
                        + "       , RESULT \n"
                        + "       , TCS_RESULT \n"
                        + "       , FEE \n"
                        + "       , DELIVER_DATE \n"
                        + "       , MOBILE_INFO \n"
                        + "       , STATUS_TEXT \n"
                        + "       , READ_TIME \n"
                        + "  FROM SDK_MMS_REPORT_DETAIL "
                        + " WHERE MSG_ID=" + row.id
                    ;
                    request.query(sqlQuery, (err, result) => {
                        if(typeof err !== 'undefined' && null != err) {
                            return res.send({
                                "status" : "500",
                                "description" : "내부 서버 오류"
                            });
                        }
    
                        try {
                            row.target = (typeof result === "undefined" || null == result
                                || typeof result.recordsets == 'undefined' || null == result.recordsets
                                || 1 > result.recordsets.length) ? [] : result.recordsets[0].slice();
                        }
                        catch (exception) {
                        	  console.log(exception);
                        }
                        
                        nextItem(i + 1);
                    });
                }
            }
            dbHelper.sqlLogWriter(sqlText);
            request.query(sqlText, (err, result) => {
                // 에러인 경우 빈객체로 리턴한다.
                if(typeof err !== 'undefined' && null != err) {
                    return res.send({
                            "status" : "500",
                            "description" : "내부 서버 오류"
                    });
                }
                
                if(0 == result.rowsAffected[0]) {
                  return res.send({
                      "status" : "204",
                      "description" : "콘텐츠 없음"
                  });
                }
                
                if(typeof id !== 'undefined' && null != id) {
                    // 결과가 없을때 에러난다.
                    datas = (0 < result.rowsAffected[0]) ? clone(result.recordset[0]) : null;
                    
                } else {
                    datas = (0 < result.rowsAffected[0]) ? result.recordsets[0].slice() : [];
                }
                //datas = (typeof id !== 'undefined' && null != id) 
                //  ? clone(result.recordset[0]) : result.recordsets[0].slice();
                nextItem(0);
            });
        });
        pool.on('error', err => {
            return res.send({
                "status" : "500",
                "description" : "내부 서버 오류"
            });
        });
    }
};