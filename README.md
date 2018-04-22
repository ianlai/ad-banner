# Ad Banner

## 1. Project Intro: 

##### Basic:
This is an ad banner service which offers the following features.  
This service is implemented in Node.js without web framework (Express).  
- Frontend: html + javascript  
- Backend: nodejs + Mongo DB (mongoose)
- Test: Jasmine

##### Features: 

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

The example of data are shown as follows. 

##### Ad schema: 
    Ad = { 
        img         : "/sample1.png",        # ad img
        url         : "www.ad.com/1",        # ad link
        ip          : "1.1.1.1",             # management IP
        timeStart   : 1523963781963,         # display time start
        timeDuration: 1000000,               # display time period
        identifier  : "ad1"                  # for debugging (app-layer id)
    }

##### Ad request format:
    AdRequest = { 
        id          : '5adc1cc9cc60d16845415d00',
        method      : 'GET',
        url         : '/5adc1cc9cc60d16845415d00',
        ip          : '1.1.1.1',
        date        : '20180422',
        time        : 1524375740961,
        timezone    : '-540' 
    }
    
##### Ad response format: (not implementted yet)
    AdResponse = {
        id          : '5adc1cc9cc60d16845415d00', 
        img         : '/sample1.png',
        url         : 'www.ad.com/1'
    }

## 3. Endpoint:

#### (1) HTML 
- **GET /** 
  - Main page. For normal user to request the main page (with an ad banner inside). 

- **GET /admin** 
  - Admin page. For ad-provider to upload ad. 

#### (2) API 
- **GET /api/v1/ads?tz=[time-zone-offset]**
  - For normal user to request ad. It will response the feasible ad based on the time and timezone.
  - time-zone-offset: offset with UTC in minutes (ex. JST: -540) 

- **GET /api/v1/ads**
  - For server manager to show all the ads in the database. 

- **GET /api/v1/ads/[:id]**  
  - For ad provider to show a specific ad with the id. This will omit the promotation time limitation, but the request need to come from a valid IP address bundled with the ad. 
 
- **POST /api/v1/ads**
  - For ad provider to upload an ad. The format needs to match the ad format. 

## 4. Files:

## 5. Unit Test:

## 6. Release Notes (Todo): 

**2018.04.21**
- Separate index.html(user) and admin.html(ad-provider)
- Refactor: separate server.js, apiHandler.js, dbHandler.js
- Test code with Jasmine (api) 
- Separate the endpoints to be two groups: HTML and APIs

**2018.04.20**
- Add a POST route to a new add
- Store the ads into Mongo DB instead of a temporary array
- Add clear and seed functions for initializing the DB
- Randomly choose one valid ad to return instead of sending all fesible ads back 

**2018.04.18**
- Server side filter ads to send back according to the promotional time
- Client side render the ad (append the text in div)
- Server side send back a specific ad for ad publisher (request with ID and correct IP)
- Server side can send all ads back

**2018.04.17** 
- Server side get request time and IP from client (1st request)
- Server side get time zone from params (2nd request)

**Todo**
- Client-side interface to easy add an ad 
- Refine the ad to send back (without ip, timeStart, timeDuration info) 


