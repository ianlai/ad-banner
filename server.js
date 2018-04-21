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
clearDatabase();
seedDatabase();

//=============================================

var mainHtml;
var mainJs;
var adminHtml;

fs.readFile('./index.js', function(err, data) {
    if (err){
        throw err;
    }
    mainJs = data;
});

fs.readFile('./index.html', function(err, data) {
    if (err){
        throw err;
    }
    mainHtml = data;
});

fs.readFile('./admin.html', function(err, data) {
    if (err){
        throw err;
    }
    adminHtml = data;
});
//=============================================

var server = http.createServer(function (req, res) {
    
    /* Get current time */
    var date = new Date();
    
    var reqTime = date.getTime();
    var reqYMD  = date.getFullYear()+pad(date.getMonth()+1)+pad(date.getDate());
    var reqTimezone = date.getTimezoneOffset();
    
    //console.log('Time: ' + reqTime);
    //console.log('YMD : ' + reqYMD);
    //console.log('TZ  : ' + reqTimezone);
    
    var ipFormatted = req.connection.remoteAddress.replace(/^.*:/, ''); //remove all colons
    
    const myURL = URL.parse(req.url, true);
    var idFormatted = myURL.path.replace(/^\/+/g, '');  //remove leading slash 
    var isMongoId = new RegExp("^[0-9a-fA-F]{24}$");
    idFormatted = isMongoId.test(idFormatted) ? idFormatted : undefined;
    
    //console.log('myURL: ', myURL);
    //console.log('param: ', myURL.query.tz);
    //console.log('req id: ', idFormatted);
    
    const adrequest = {
        id      : idFormatted,
        method  : req.method,
        url     : req.url,
        ip      : ipFormatted,
        date    : reqYMD,
        time    : reqTime,
        timezone: undefined
    }
    adrequest.ip = "104.0.0.1";
    console.log("----------------------");
    console.log('adrequest: ', adrequest);
    
    /* Send index.html (if no timezone) or send the feasible ad list (if there is timezone) */
    if(myURL.pathname==='/' && adrequest.method==='GET'){
        /* Timezone not received yet */
        if(myURL.query.tz===undefined){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(mainHtml);
            res.end();
        }
        /* Timezone received; filtered the ads and send the ads */
        else{
            adrequest.timezone = myURL.query.tz;
            getAd(adrequest, function(returnedAds){
                console.log("Feasible Ad List -> " + returnedAds);
                
                /* Send response */
                res.writeHead(200, {'Content-Type': 'text/json'});
                res.end(JSON.stringify(returnedAds));
            });
        }
    }
    /* Send index.js to let client send the timezone to request the ad */
    else if(myURL.pathname==='/index.js' && adrequest.method==='GET'){
        console.log('GET /index.js');
        res.writeHead(200, {'Content-Type': 'application/javascript'});
        res.write(mainJs);
        res.end();
    }
    /* Send admin.html */
    else if(myURL.pathname==='/admin' && adrequest.method==='GET'){
        console.log('GET /admin');
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(adminHtml);
        res.end();
    }
    /* Request all the ads in the database */
    else if(myURL.pathname==='/all' && adrequest.method==='GET'){
        getAd(0, function(returnedAds){
            console.log("All Ad List -> " + returnedAds);
            res.writeHead(200, {'Content-Type': 'text/json'});
            res.end(JSON.stringify(returnedAds));
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
    /* Omit the request of favicon */
    else if(adrequest.url==='/favicon.ico' && adrequest.method==='GET'){  
        res.writeHead(204);
        return;
    }
    /* Add an ad */
    else if(myURL.pathname==='/' && adrequest.method==='POST'){
        parsePostBody(req, (chunks) => {
            var parsed = JSON.parse(chunks.toString());  
            var newAd = {
                id : parsed.id,
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