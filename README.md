Ad Banner 

Ad: 
1. img
2. url 
3. display time start
4. display time period
5. display time zone
6. management IP

Process - Show Ad
1. [Client] GET /ad
2. [Server] response ad.html + ad.js 
3. [Client] ad.js GET /ad/one with its timezone info 
4. [Server] according to ip, timestamp, timezone, randomly respond one ad
5. [Client] render the add 

Process - Add Ad
1. [Client] POST /ad 
2. [Server] Store into db 