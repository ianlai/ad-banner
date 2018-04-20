# Ad Banner

## 1. Project Intro: 
This is an ad banner service which offers the following features.
This service is implemented in Node.js without web framework, e.g. Express.

- Ad platform : 
	1. Provides the API server. 
	2. Provides the main page with an ad banner. 
	3. Test code  
- Ad publisher: 
	1. Add a new ad 
  	2. Assign the promotional time to show the ad 
  	3. Check the ad out of the promotional time as long as using the valid IP
- Client      : 
	1. Access the main page and randomly see an ad which is in its promotional time.

**Temporary test url:** 
- https://webdevbootcamp-ianlai.c9users.io/
 

## 2. Data Format: 

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

## 3. API: 
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

## 4. Release Notes (Todo): 

**2018.04.17** 
- Server side get request time and IP from client (1st request)
- Server side get time zone from params (2nd request)

**2018.04.18**
- Server side filter ads to send back according to the promotional time
- Client side render the ad (append the text in div)
- Server side send back a specific ad for ad publisher (request with ID and correct IP)
- Server side can send all ads back

**2018.04.20**
- Add a POST route to a new add
- Store the ads into Mongo DB instead of a temporary array
- Add clear and seed functions for initializing the DB
- Randomly choose one valid ad to return instead of sending all fesible ads back 

**Todo**
- Client-side interface to easy add an ad 
- Refine the ad to send back (without ip, timeStart, timeDuration info) 
- Test code 

