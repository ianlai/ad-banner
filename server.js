//var express = require("express");
//var bodyParser = require("body-parser");

var http = require('http');
var URL  = require('url');
var fs   = require('fs');

var dbHandler     = require("./dbHandler");
var Ad            = dbHandler.Ad;
var seedDatabase  = dbHandler.seedDatabase;
var clearDatabase = dbHandler.clearDatabase;

var apiHandler = require("./apiHandler");
var getAd      = apiHandler.getAd;
var pad        = apiHandler.pad;

//=============================================

/* Initialization the database (for debugging) */
//clearDatabase();
//seedDatabase();

//=============================================

var mainHtml;
var mainJs;
var adminHtml;
var adminJs;

fs.readFile('./public/index.js', function(err, data) {
    if (err){
        throw err;
    }
    mainJs = data;
});

fs.readFile('./public/index.html', function(err, data) {
    if (err){
        throw err;
    }
    mainHtml = data;
});

fs.readFile('./public/admin.html', function(err, data) {
    if (err){
        throw err;
    }
    adminHtml = data;
});

fs.readFile('./public/admin.js', function(err, data) {
    if (err){
        throw err;
    }
    adminJs = data;
});
//=============================================

var server = http.createServer(function (req, res) {
    
    /* Handle request: time */
    var date = new Date();  /* Get current time */
    var reqTime = date.getTime();
    var reqYMD  = date.getFullYear()+pad(date.getMonth()+1)+pad(date.getDate());
    var reqTimezone = date.getTimezoneOffset();
    
    //console.log('Time: ' + reqTime);
    //console.log('YMD : ' + reqYMD);
    //console.log('TZ  : ' + reqTimezone);
    
    /* Handle request : IP */
    var ipFormatted = req.connection.remoteAddress.replace(/^.*:/, ''); //remove all colons
    
    /* Handle request : URL */
    const apiUrl = '/api/v1/ads'; 
    var myURL = URL.parse(req.url, true);
    if(myURL.path=='/'){
        /* Main page: do nothing */
    }else{
        /* Other endpoints: remove the tailing slash if there is */
        myURL.path = myURL.path.replace(/\/$/g, '');  //remove tailing slash 
        myURL.pathname = myURL.pathname.replace(/\/$/g, '');  //remove tailing slash 
    }
    var idFormatted;
    if(myURL.path.startsWith(apiUrl)){
        var idIndex = myURL.path.startsWith(apiUrl);
        idFormatted = myURL.path.substring(apiUrl.length+1);
    }
    //console.log('URL: ', myURL);
    //console.log('URL-id: ', idFormatted);
    //console.log('URL-tz: ', myURL.query.tz);
    
    var isMongoId = new RegExp("^[0-9a-fA-F]{24}$");
    idFormatted = isMongoId.test(idFormatted) ? idFormatted : undefined;
    
    const adrequest = {
        id      : idFormatted,
        method  : req.method,
        url     : req.url,
        ip      : ipFormatted,
        date    : reqYMD,
        time    : reqTime,
        timezone: undefined
    }
    adrequest.ip = "10.0.0.1";
    //console.log('adrequest: ', adrequest);
    
    /* ============================== */
    /* ======== Static Files ======== */
    /* ============================== */
    
    /* Send index.html: main page with ad banner */
    if(myURL.path==='/' && adrequest.method==='GET'){
        console.log('GET /index.html');
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(mainHtml);
        res.end();
    }
    /* Send index.js: let client send back the timezone with Ajax to request the ad */
    else if(myURL.path==='/index.js' && adrequest.method==='GET'){
        console.log('GET /index.js');
        res.writeHead(200, {'Content-Type': 'application/javascript'});
        res.write(mainJs);
        res.end();
    }
    /* Send admin.html: ad-publisher can post an add with this page  */
    else if(myURL.path==='/admin' && adrequest.method==='GET'){
        console.log('GET /admin.html');
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(adminHtml);
        res.end();
    }
    /* Send admin.js: send Ajax post request to add an add   */
    else if(myURL.path==='/admin.js' && adrequest.method==='GET'){
        console.log('GET /admin.js');
        res.writeHead(200, {'Content-Type': 'application/javascript'});
        res.write(adminJs);
        res.end();
    }
    /* Ignore the request of favicon */
    else if(adrequest.url==='/favicon.ico' && adrequest.method==='GET'){  
        res.writeHead(204);
        res.end();
        return;
    }
    
    /* ===================== */
    /* ======== API ======== */
    /* ===================== */
    
    /* Request all the ads in the database */
    else if(myURL.pathname==='/api/v1/ads' && adrequest.method==='GET' && myURL.query.tz===undefined){
        console.log('GET /api/v1/ads');
        getAd(0, function(returnedAds){
            console.log("All Ad List -> " + returnedAds);
            res.writeHead(200, {'Content-Type': 'text/json'});
            res.end(JSON.stringify(returnedAds));
        });
    }
    /* Request one ad randomly in the database which matches the timezone */
    else if(myURL.pathname==='/api/v1/ads' && adrequest.method==='GET' && myURL.query.tz){
        console.log('GET /api/v1/ads?tz='+myURL.query.tz);
        
        /* Timezone received; filtered the ads and send the ads */
        adrequest.timezone = myURL.query.tz;
        //console.log('adrequest with tz: ', adrequest);
        
        getAd(adrequest, function(returnedAds){
            //console.log("Feasible Ad List -> " + returnedAds);
            
            /* Send response */
            res.writeHead(200, {'Content-Type': 'text/json'});
            res.end(JSON.stringify(returnedAds[0]));
        });
    }
    /* Request a specific ad with its id */
    else if(adrequest.id!==undefined && adrequest.method==='GET'){ 
        console.log('GET /api/v1/ads/:id');
        
        getAd(adrequest, function(ad){
            //console.log("Request Specific ad -> " + ad);
            if(ad!==undefined){
                /* Send response */
                res.writeHead(200, {'Content-Type': 'text/json'});
                res.end(JSON.stringify(ad));
            }
        });
    }
    /* Add an ad */
    else if(myURL.path==='/api/v1/ads' && adrequest.method==='POST'){
        console.log('POST /api/v1/ads');
        parsePostBody(req, (chunks) => {
            var parsed = JSON.parse(chunks.toString());  
            
            /* Add to database */
            Ad.create({
                img: parsed.img,
                url: parsed.url,
                ip: parsed.ip,
                timeStart: parsed.timeStart, 
                timeDuration: parsed.timeDuration
            }, function(err, saved){
                if(err){
                    console.log("DB error: " + err);
                }else{
                    console.log(`New ad has been saved: ${saved._id}`);
                    res.end(`New ad has been saved: ${saved._id}`); 
                }
            });
        });
    }else{
        console.log('Bad Request');
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end("Bad Request");
    }
    
}).listen(process.env.PORT);

var parsePostBody = function (req, done) {
    var arr = [];
    var chunks;
    req.on('data', buff => {
        arr.push(buff);
    });
    req.on('end', () => {
        chunks = Buffer.concat(arr);
        done(chunks);
    });
};