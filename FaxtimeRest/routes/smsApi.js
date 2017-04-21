var sql = require('mssql');

var config = {
    user: 'faxtime',
    password: 'test2016!',
    server: 'faxtimedb.database.windows.net',
    database: 'faxtime01',
    options: {
        encrypt: true
    }
}

exports.insertSms = (req, res) => {

    console.log("TTTTTTTTTTTTTT");

    var id = req.body.id;

    sql.connect(config, (err) => {
        var request = new sql.Request();
        request.query("select nsid from tbluser where vuserid='erlking87'", function (err, recordset) {
            console.log(recordset.recordset[0].nsid);

            res.send(recordset.recordset[0].nsid);
        });
    });

};

exports.selectSms = (req, res) => {

};