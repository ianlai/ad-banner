var http = require('http');
var qs = require('querystring');
var URL = require('url');
var fs = require('fs');
//var bodyParser = require("body-parser");

var dbutil = require("./dbutil");
var Ad            = dbutil.Ad;
var seedDatabase  = dbutil.seedDatabase;
var clearDatabase = dbutil.clearDatabase;
//=============================================

/* Initialization the database (for debugging) */
clearDatabase();
seedDatabase();

var htmlFile;
var jsFile;

fs.readFile('./index.js', function(err, data) {
    if (err){
        throw err;
    }
    jsFile = data;
});

fs.readFile('./index.html', function(err, data) {
    if (err){
        throw err;
    }
    htmlFile = data;
});

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
            res.write(htmlFile);
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
        res.write(jsFile);
        res.end();
        
    }
    /* Request all the ads in the database */
    else if(myURL.pathname==='/all' && adrequest.method==='GET'){
        getAd(0, function(returnedAds){
            console.log("All Ad List -> " + returnedAds);
            
            /* Send response */
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

function getAd(adr, callback){
    console.log('getAd()');
    
    /* (1) Get all the list. */
    if(adr==0){
        console.log("Request all ads");
        Ad.find({}, function(err, ads){
           if(err){
                console.log("DB error: " + err);
           }else{
                callback(ads);
           }
        });
    }
    /* (2) Get a specific ad assigned by id.
           Time is not considered but IP needs to be validated. */
    else if(adr.id!==undefined){
        console.log("Request single ad");
        Ad.findById(adr.id, function(err, ad){
            if(err){
                console.log("DB error: " + err);
            }else
                console.log("ad " + ad);
                console.log("req ip: " + adr.ip);
                console.log("ad  ip: " + ad.ip);
                if(adr.ip==ad.ip){
                    console.log("Authorized IP");
                    callback(ad);
                }else{
                    console.log("Not authorized IP");
                    //callback(ad);
                }
        });
    }
    /* (3) Get a feasible ad list
           Check the time and timezone info. */
    else{
        console.log("Request ads match the promotion time");
        var currentTime = adr.time;
        var clientTime = adr.time + adr.timezone*60*1000;  
        //console.log('server:    ' + currentTime);
        //console.log('client:    ' + clientTime);
        //console.log('server-readable:    ' + getReaderableTime(currentTime));
        //console.log('client-readable:    ' + getReaderableTime(clientTime));
        console.log("=== Retrieving ads within promotional period === ");
        var findParams = {};
        findParams.$where = 
                `function(){` + 
                `return ${clientTime}>this.timeStart && ${clientTime}<(this.timeStart+this.timeDuration);` +
                `}`;
        Ad.find(findParams, function(err, ads){
           if(err){
                console.log("DB error: " + err);
           }else{
                ads.forEach(function(ad){
                    console.log('>> id:       ' + ad.id);
                    var start = getReaderableTime(ad.timeStart);
                    var end = getReaderableTime(ad.timeStart+ad.timeDuration);
                    
                    console.log('>> period:    ' + start + "--" + end);
                    //console.log('start:    ' + getReaderableTime(ad.timeStart));
                    //console.log('duration: ' + getReaderableTime(ad.timeDuration));
                    //console.log('end:      ' + getReaderableTime(ad.timeStart+ad.timeDuration));
                })
                callback(ads);
           }
        });
    }
}

function getReaderableTime(time){
    var timeObj = new Date(time);
    var yyyy = timeObj.getFullYear();
    var mm = timeObj.getMonth()+1;
    var dd = timeObj.getDate();
    var hour= timeObj.getHours();
    var min = timeObj.getMinutes();
    var sec = timeObj.getSeconds();
    var output = yyyy + "-" 
            + pad(mm) + "-" 
            + pad(dd) + " " 
            + pad(hour) + ":" 
            + pad(min) + ":" 
            + pad(sec);
    return output;
}

function pad(n) {
    return n<10 ? '0'+n : n
}