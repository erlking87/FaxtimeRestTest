'use strict';

var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var request = require('request');
var fs = require('fs'); //<< req.file랑 동일할것 같다.
//var data = fs.readFileSync('./index.html', 'utf8');

// not allow asp,php,jsp,vb,dll,js,css,aspx,wsc,pfs,asa,java
var dbHelper = require('./dbHelper');


module.exports = {
    uploadFile : function (req, res, next) {
        // 메모리스토리지 사용시도 결과 아웃어브메모리 발생
        var findObject = function (id, object, defaultValue) {
            if(typeof id === "undefined" || null == id
                || typeof object === "undefined" || null == object
            ) return (typeof defaultValue === "undefined") ? "" : defaultValue;
            if(typeof object[id] === "undefined" || null == object[id]
            ) return (typeof defaultValue === "undefined") ? "" : defaultValue;
            return object[id];
        }
    
        var formFile = {};
        formFile["value"] = fs.createReadStream(req.file.path);
        formFile["options"] = {};
        formFile["options"]["filename"] = req.file.originalname;
        formFile["options"]["contentType"] = req.file.mimetype;

        var formData = {};
        formData["objName"] = findObject("objName", req.query, "mmsfile1");
        formData["maxByte"] = findObject("maxByte", req.query, req.file.size);
        formData["subPath"] = findObject("subPath", req.query, "mmsfile");
        formData[findObject("objName", req.query, "mmsfile1")] = formFile;

        const options = {
            url : "https://www.faxwide.com/web/ajaxFileUpload.do",
            //url : "http://150.1.4.35:8088/web/ajaxFileUpload.do",
            headers: {
                "Accept": "application/json",
                "Accept-Charset": "utf-8",
                "User-Agent": "faxwide-client"
            },
            formData: formData
        };
        
        request.post(options, function optionalCallback(err, httpResponse, body) {
            fs.exists(req.file.path, exists => {
                if(exists) fs.unlink(req.file.path);
            });
            if (err) {
                return res.send({
                    "status" : "500",
                    "description" : "내부 서버 오류"
                });
            }
            var result = {
                "status" : "200",
                "description" : "성공",
                "datas" : JSON.parse(body)
            };
            return res.send(result);
        });
    }
};