var dbHandler = require("./dbHandler");
var Ad        = dbHandler.Ad;

function getAd(adr, callback){
    
    /* (1) Get all ads. */
    if(adr==0){
        console.log(">> Request all ads");
        Ad.find({}, function(err, ads){
           if(err){
                console.log("DB error: " + err);
           }else{
                callback(ads);
                // ads.forEach(function(ad){
                //     console.log('>> id:       ' + ad.id);
                //     var start = getReaderableTime(ad.timeStart);
                //     var end = getReaderableTime(ad.timeStart+ad.timeDuration);
                //     console.log('>> img:    ' + ad.img); 
                //     console.log('>> period:    ' + start + "--" + end);
                //     console.log('start:    ' + getReaderableTime(ad.timeStart));
                //     console.log('duration: ' + getReaderableTime(ad.timeDuration));
                //     console.log('end:      ' + getReaderableTime(ad.timeStart+ad.timeDuration));
                // })
           }
        });
    }
    /* (2) Get a specific ad requested by id.
           Time is not considered but IP needs to be matched. */
    else if(adr.id!==undefined){
        console.log(">> Request single ad with id (IPs must matches)");
        Ad.findById(adr.id, function(err, ad){
            if(err){
                console.log("DB error: " + err);
            }else{
                // console.log("Req ID: " + adr.id);
                // console.log("Req ip: " + adr.ip);
                // console.log("Returned ad: " + ad);
                // console.log("ad  ID: " + ad.id);
                // console.log("ad  ip: " + ad.ip);
                if(!ad){
                    callback("Not found.");
                }else{
                    if(adr.ip==ad.ip){
                        console.log("Authorized IP");
                        callback(ad);
                    }else{
                        console.log("Not authorized IP");
                        callback(null);
                    }
                }
            }
        });
    }
    /* For debug use */
    else if(adr.identifier!==undefined){
        console.log(">> Request single ad with identifier (not id): " + adr.identifier);
        Ad.findOne({identifier: adr.identifier}, function(err, ad){
            if(err){
                console.log("DB error: " + err);
            }else{
                callback(ad);
            }
        });
    }
    /* (3) Get a feasible ad list.
           Check the time and timezone info. 
           Randomly choose one ad from the ad list to return */
    else{
        console.log(">> Request ads match the promotion time");
        var currentTime = adr.time;
        var clientTime = adr.time + adr.timezone*60*1000;  
        //console.log('server:    ' + currentTime);
        //console.log('client:    ' + clientTime);
        //console.log('server-readable:    ' + getReaderableTime(currentTime));
        //console.log('client-readable:    ' + getReaderableTime(clientTime));
        var findParams = {};
        findParams.$where = 
                `function(){` + 
                `return ${clientTime}>this.timeStart && ${clientTime}<(this.timeStart+this.timeDuration);` +
                `}`;
        Ad.find(findParams, function(err, ads){
           if(err){
                console.log("DB error: " + err);
           }else{
                // ads.forEach(function(ad){
                //     console.log('>> id:       ' + ad.id);
                //     var start = getReaderableTime(ad.timeStart);
                //     var end = getReaderableTime(ad.timeStart+ad.timeDuration);
                //     console.log('>> img:    ' + ad.img); 
                //     console.log('>> period:    ' + start + "--" + end);
                //     console.log('start:    ' + getReaderableTime(ad.timeStart));
                //     console.log('duration: ' + getReaderableTime(ad.timeDuration));
                //     console.log('end:      ' + getReaderableTime(ad.timeStart+ad.timeDuration));
                // })
                
                /* return a fesible ad randomly choosed from the fesible array */
                var rand = [];
                rand.push(ads[Math.floor(Math.random() * ads.length)]);
                callback(rand);
                
                /* return a fesible ad array */
                //callback(ads);
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

module.exports = {
    getAd: getAd, 
    pad  : pad
};