/*
    ½Ç¼­¹ö
*/
var dbConfig = {
    user: 'faxtime',
    password: 'test2016!',
    server: 'faxtimedb.database.windows.net',
    database: 'faxtimeApiTest',
    connectionTimeout: 300000,
    requestTimeout: 300000,
    options: {
        encrypt: true
    }
};

/*
    Å×½ºÆ®¼­¹ö
*/
/*
var dbConfig = {
    user: 'taiho',
    password: 'xkdlgh123!',
    server: '150.1.4.61',
    database: 'ufws01',
    options: {
        encrypt: true
    }
};
*/

module.exports = dbConfig;
