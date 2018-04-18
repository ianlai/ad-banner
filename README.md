# Ad Banner 

### Ad: 
    const Ad = {
        id: 1, 
        img: "img1",                # ad img
        url: "url1",                # ad link
        ip: "101.0.0.1",            # management IP
        timeStart: 1523963781963,   # display time start
        timeDuration: 1000000       # display time period
    }

### Ad request:
    const adrequest = {
        id      : idFormatted, 
        method  : req.method,   
        url     : req.url,
        ip      : ipFormatted,  # remove ipv6
        date    : reqYMD,       # server time 
        time    : reqTime,      # server time
        timezone: undefined     # client timezone
    }

### API: 
Get ad (normal user, it will response the feasible list based on the time and timezone)
- GET / 
- GET /?tz=[Time-zone-offset]  ex. -540

Get ad (ad manager, it can add or get an ad with the check of IP and without the time limitation)
- GET /id 
- POST / 

### Done and Todo: 
- v Server side get time, timezone, IP from client (two phases)
- v Server side choose ads to send back (time calculation)
- v Client side render the ad (append in div)
- v Server side send back the specific ad if client is the ad manager (request with ID and correct IP)
<br /><br />
- x Refine the ad to send back (without ip, timeStart, timeDuration info) 
- x Send back one ad only instead of a list  
- x Add new add (POST request)
- x Store the ads into DB 
- x Test code 

