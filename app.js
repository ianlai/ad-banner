var http = require('http');
var qs = require('querystring');
var URL = require('url');
var fs = require('fs');

var htmlFile;
var jsFile;

var adList = [
    {id: 1, img: "img1", url: "url1", ip: "101.0.0.1", timeStart: 1523963781963, timeDuration: 1000000},
    {id: 2, img: "img2", url: "url2", ip: "102.0.0.1", timeStart: 1523963781963, timeDuration: 30000000},  //show
    {id: 3, img: "img3", url: "url3", ip: "103.0.0.1", timeStart: 1623963781963, timeDuration: 1000},
    {id: 4, img: "img4", url: "url4", ip: "104.0.0.1", timeStart: 1523965447538, timeDuration: 1000000000},  //show
    {id: 5, img: "img5", url: "url5", ip: "10.240.1.191", timeStart: 1523980600000, timeDuration: 800000000}  //show
]

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
    // var reqTime = date.toLocaleDateString('en-gb', {  
    // 	day:    '2-digit',
    //     month:  '2-digit',
    //     year:   'numeric',
    //     hour:   '2-digit',
    //     minute: '2-digit',
    //     second: '2-digit'
    // });
    
    var reqYMD  = date.getFullYear()+pad(date.getMonth()+1)+pad(date.getDate());
    var reqTimezone = date.getTimezoneOffset();
    
    //console.log('Time: ' + reqTime);
    //console.log('YMD : ' + reqYMD);
    //console.log('TZ  : ' + reqTimezone);
    
    var ipFormatted = req.connection.remoteAddress.replace(/^.*:/, ''); //remove all colons
    
    const myURL = URL.parse(req.url, true);
    var idFormatted = myURL.path.replace(/^\/+/g, '');  //remove leading slash 
    idFormatted = !isNaN(idFormatted) ? idFormatted : undefined;
    //var path = myURL.path.replace(/^\/+/g, '');  //remove leading slash 
    //var idFormatted = path.substring(0,2)==='' ? path.substring(2).replace(/^\/+/g, '') : undefined;
    //console.log('myURL: ', myURL);
    //console.log('param: ', myURL.query.tz);
    console.log('req id: ', idFormatted);
    
    /* HEAD */
    const adrequest = {
        id      : idFormatted,
        method  : req.method,
        url     : req.url,
        ip      : ipFormatted,
        date    : reqYMD,
        time    : reqTime,
        timezone: undefined
    }
    console.log('adrequest: ', adrequest);
    
    if(myURL.pathname==='/' && adrequest.method==='GET'){
        
        /* Timezone not sent yet */
        if(myURL.query.tz===undefined){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(htmlFile);
            res.end();
        }else{
            adrequest.timezone = myURL.query.tz;
            var feasibleAdList = JSON.stringify(getAd(adrequest));
            console.log("Feasible Ad List:" + feasibleAdList);
            
            /* Send response */
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(feasibleAdList);  //should not send the full list ; should not send other info 
        }
        
    }else if(myURL.pathname==='/index.js' && adrequest.method==='GET'){
        console.log('GET /index.js');
        res.writeHead(200, {'Content-Type': 'application/javascript'});
        res.write(jsFile);
        res.end();
    }else if(adrequest.id!==undefined && adrequest.method==='GET'){ /* show determined ad */
        console.log('GET /:id');
        var feasibleAdList = getAd(adrequest); 
        if(feasibleAdList==null){
            console.log('no request id: ' + adrequest.id);
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end("Bad request.");
        }else{
            var feasibleAdList = JSON.stringify(getAd(adrequest));
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(feasibleAdList);
        }
    }else if(adrequest.url==='/favicon.ico' && adrequest.method==='GET'){  /* Omit the request of favicon */
        res.writeHead(204);
        return;
    }else{
        console.log('ERROR');
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end("Error");
    }
    
}).listen(process.env.PORT);

function pad(n) {
    return n<10 ? '0'+n : n
}

function getAd(adr){
    console.log('getAd()');
    
    /* Useage1 - Get a specific ad
       Ad's id is assigned by client.
       IP needs to be checked. */
    if(adr.id!==undefined){
        //adList.forEach(function(ad){
        //    console.log('id:       ' + ad.id);
        //})
        var feasibleAd = adList.filter(ad => ad.id==adr.id);
        //console.log(adr.id);
        if(feasibleAd.length==0){
            console.log("No matched ID");
            return null;
        }else{
            if(adr.ip==feasibleAd[0].ip){
                console.log("Authorized IP");
                return feasibleAd[0];
            }else{
                console.log("Not authorized IP");
                return null;
            }
        }
    }else{
        /* Useage2 - Get a feasible ad list
           Check the time and timezone info. */
        var currentTime = adr.time;
        var clientTime = adr.time + adr.timezone*60*1000;  
        console.log('server:    ' + currentTime);
        console.log('client:    ' + clientTime);
        console.log('server-readable:    ' + getReaderableTime(currentTime));
        console.log('client-readable:    ' + getReaderableTime(clientTime));
        adList.forEach(function(ad){
            console.log('id:       ' + ad.id);
            console.log('start:    ' + getReaderableTime(ad.timeStart));
            //console.log('duration: ' + getReaderableTime(ad.timeDuration));
            console.log('end:      ' + getReaderableTime(ad.timeStart+ad.timeDuration));
        })
        
        /* Filter ad list with the time */
        var feasibleAdList = adList.filter(ad => clientTime> ad.timeStart && clientTime< ad.timeStart+ad.timeDuration);
        
        return feasibleAdList;
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