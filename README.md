# Ad Banner 

## Format: 

##### Ad format: 
    Ad = { 
        img: "img1",                # ad img
        url: "url1",                # ad link
        ip: "101.0.0.1",            # management IP
        timeStart: 1523963781963,   # display time start
        timeDuration: 1000000       # display time period
    }

##### Ad request format:
    AdRequest = {
        id      : idFormatted, 
        method  : req.method,   
        url     : req.url,
        ip      : ipFormatted,  # remove ipv6
        date    : reqYMD,       # server time 
        time    : reqTime,      # server time
        timezone: undefined     # client timezone
    }
    
##### Ad response format: (not implementted yet)
    AdResponse = {
        id      : idFormatted, 
        url     : req.url,
        ip      : ipFormatted,  # remove ipv6
    }

## API: 
- **GET /** 
  - For normal user to request ad. Since the client didn't send the timezone info, server will send back a html with JS to request again with timezone info in the param. 

- **GET /?tz=[Time-zone-offset-to-UTC-in-min]**
  - For normal user to request ad. It will response the feasible ad based on the time and timezone.

- **GET /all**
  - For server manager to show all the ads in the database. 

- **GET /[:id]**  
  - For ad provider to show a specific ad with the id. This will omit the promotation time limitation, but the request need to come from a valid IP address bundled with the ad. 
 
- **POST /**
  - For ad provider to upload an ad. The format needs to match the ad format. 

## Release Notes (Todo): 

**2018.04.17** 
- Server side get time, timezone, IP from client (two phases)

**2018.04.18**
- Server side choose ads to send back (time calculation)
- Client side render the ad (append in div)
- Server side send back the specific ad if client is the ad manager (request with ID and correct IP)

**2018.04.20**
- Add new add (POST request)
- Store the ads into DB 
- Add clear and seed functions for initialize the DB.

**Todo**
- Client-side interface to easy add an ad 
- Refine the ad to send back (without ip, timeStart, timeDuration info) 
- Send back one ad only instead of a list  
- Test code 

