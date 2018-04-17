var http = require('http');
var qs = require('querystring');
//var moment = require('moment');
//var url = require('url');
var URL = require('url');
var fs = require('fs');

var htmlFile;
var jsFile;

fs.readFile('./app.js', function(err, data) {
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
    
    var server = http.createServer(function (req, res) {
    
    var date = new Date();
    //var reqTime = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    var reqTime = date.getTime();
    var reqYMD  = date.getFullYear()+pad(date.getMonth()+1)+pad(date.getDate());
    var reqTimezone = date.getTimezoneOffset();
    
    console.log('Time: ' + reqTime);
    console.log('YMD : ' + reqYMD);
    console.log('TZ  : ' + reqTimezone);
    
    var ipFormatted = req.connection.remoteAddress.replace(/^.*:/, '');
    
    /* HEAD */
    const adrequest = {
        method  : req.method,
        url     : req.url, 
        ip      : ipFormatted,
        date    : reqYMD,
        time    : reqTime,
        timezone: getTimezone()
    }
    
    //const myUrl = url.parse(req.url);
    //console.log("myUrl: " + myUrl);
    
    if(adrequest.url==='/favicon.ico' && adrequest.method==='GET'){
        res.writeHead(204);
        return;
    };
    
    //const { URL } = require('url');
    
    const myURL = URL.parse(req.url, true);
    //console.log('myURL: ', myURL);
    console.log('param: ', myURL.query.tz);
    
    console.log('adrequest: ', adrequest);
    if(myURL.pathname==='/' && adrequest.method==='GET'){
        /* Timezone not sent yet */
        if(myURL.query.tz===undefined){
            /* Send response */
            //res.end("Please send the timezone info back");
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(htmlFile);
            res.end();
        }else{
            //res.send(obj);
            //res.sendFile('index.html');
            var feasibleAdList = JSON.stringify(getAd(adrequest));
            console.log("Feasible Ad List:" + feasibleAdList);
            
            /* Send response */
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(feasibleAdList);
        }
        
    }else if(myURL.pathname==='/app.js' && adrequest.method==='GET'){
        console.log('app.js');
        res.writeHead(200, {'Content-Type': 'application/javascript'});
        res.write(jsFile);
        res.end();
    }
    else if (req.method === 'GET' && req.url === '/echo') {
        console.log('GET /echo');
        //res.sendFile('index.html');
    }else if (req.method === 'GET' && req.url.s === '/') {
        //var url = new URL(url_string);
        //var c = url.searchParams.get("c");
        console.log('GET /echo');
        //res.sendFile('index.html');
    }else if(adrequest.url==='/ad' && adrequest.method==='GET'){
        
    }else{
        console.log('ERROR');
    }
    
}).listen(process.env.PORT);
});



var adList = [
    {img: "img1", url: "url1", ip: "", timeStart: 1523963781963, timeDuration: 1000000},
    {img: "img2", url: "url2", ip: "", timeStart: 1523963781963, timeDuration: 30000000},  //show
    {img: "img3", url: "url3", ip: "", timeStart: 1623963781963, timeDuration: 1000},
    {img: "img4", url: "url4", ip: "", timeStart: 1523965447538, timeDuration: 100000000}  //show
]

function pad(n) {
    return n<10 ? '0'+n : n
}

function getTimezone() {
  var tzo = new Date().getTimezoneOffset();  //returns timezone offset in minutes
  function pad(num, digits) {
    num = String(num); while (num.length < digits) { num="0"+num; }; return num;
  }
  return "GMT" + (tzo > 0 ? "-" : "+") + pad(Math.floor(tzo/60), 2) + ":" + pad(tzo%60, 2);
}


function getAd(adr){
    console.log('getAd()');
    var currentTime = adr.time;

    /* Special IP or not */
    
    /* Filter ad list with the time */
    var feasibleAdList = adList.filter(ad => currentTime> ad.timeStart && currentTime< ad.timeStart+ad.timeDuration);

    return feasibleAdList;
    // adList.forEach(function(ad){
    //     console.log('startTime:   ' + ad.timeStart);
    //     if(currentTime> ad.timeStart && currentTime< ad.timeStart+ad.timeDuration){
    //         console.log("OK");
    //     }else{
    //         console.log("no...");
    //     }
    // })
}
