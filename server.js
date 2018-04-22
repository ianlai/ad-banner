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
    const myURL = URL.parse(req.url, true);
    if(myURL.path=='/'){
        /* Main page: do nothing */
    }else{
        myURL.path = myURL.path.replace(/\/$/g, '');  //remove tailing slash 
        myURL.pathname = myURL.pathname.replace(/\/$/g, '');  //remove tailing slash 
    }
    var idFormatted; //= myURL.path.replace(/^\/+/g, '');  //remove leading slash 
    //console.log('URL: ', myURL);
    const apiUrl = '/api/v1/ads'; 
    if(myURL.path.startsWith(apiUrl)){
        var idIndex = myURL.path.startsWith(apiUrl);
        idFormatted = myURL.path.substring(apiUrl.length+1);
    }
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
    adrequest.ip = "3.3.3.3";
    console.log("----------------------");
    console.log('adrequest: ', adrequest);
    
    /* ============================== */
    /* ======== Static Files ======== */
    /* ============================== */
    
    /* Send index.html */
    if(myURL.path==='/' && adrequest.method==='GET'){
        console.log('GET /index.html');
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(mainHtml);
        res.end();
    }
    /* Send index.js to let client send back the timezone to request the ad with Ajax*/
    else if(myURL.path==='/index.js' && adrequest.method==='GET'){
        console.log('GET /index.js');
        res.writeHead(200, {'Content-Type': 'application/javascript'});
        res.write(mainJs);
        res.end();
    }
    /* Send admin.html */
    else if(myURL.path==='/admin' && adrequest.method==='GET'){
        console.log('GET /admin.html');
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(adminHtml);
        res.end();
    }
    /* Send admin.js */
    else if(myURL.path==='/admin.js' && adrequest.method==='GET'){
        console.log('GET /admin.js');
        res.writeHead(200, {'Content-Type': 'application/javascript'});
        res.write(adminJs);
        res.end();
    }
    /* Omit the request of favicon */
    else if(adrequest.url==='/favicon.ico' && adrequest.method==='GET'){  
        res.writeHead(204);
        return;
    }
    
    /* ===================== */
    /* ======== API ======== */
    /* ===================== */
    /* Request all the ads in the database */
    else if(myURL.pathname==='/api/v1/ads' && adrequest.method==='GET' && myURL.query.tz===undefined){
        getAd(0, function(returnedAds){
            console.log("All Ad List -> " + returnedAds);
            res.writeHead(200, {'Content-Type': 'text/json'});
            res.end(JSON.stringify(returnedAds));
        });
    }
    /* Request one ad randomly in the database which matches the timezone */
    else if(myURL.pathname==='/api/v1/ads' && adrequest.method==='GET' && myURL.query.tz){
                    
        /* Timezone received; filtered the ads and send the ads */
        adrequest.timezone = myURL.query.tz;
        console.log('adrequest with tz: ', adrequest);
        getAd(adrequest, function(returnedAds){
            console.log("Feasible Ad List -> " + returnedAds);
            
            /* Send response */
            res.writeHead(200, {'Content-Type': 'text/json'});
            res.end(JSON.stringify(returnedAds[0]));
        });
        
    }
    /* Request a specific ad with its id */
    else if(adrequest.id!==undefined && adrequest.method==='GET'){ 
        console.log('GET /:id');
        
        getAd(adrequest, function(ad){
            console.log("Request Specific ad -> " + ad);
            if(ad!==undefined){
                /* Send response */
                res.writeHead(200, {'Content-Type': 'text/json'});
                res.end(JSON.stringify(ad));
            }
        });
    }
    /* Add an ad */
    else if(myURL.path==='/api/v1/ads' && adrequest.method==='POST'){
        parsePostBody(req, (chunks) => {
            console.log("=================");
            console.log(chunks.toString());
            console.log("=================");
            var parsed = JSON.parse(chunks.toString());  
            var newAd = {
                img: parsed.img,
                url: parsed.url,
                ip:  parsed.ip,
                timeStart:    parsed.timeStart,
                timeDuration: parsed.timeDuration
            }
           
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
                    console.log(`Ad (${saved._id}) saved.`);
                    res.end(`${saved._id} has been added.`); 
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
    var length = req.headers['content-length'] - 0;
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