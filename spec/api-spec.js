/* global expect */
/* global done */
/* global beforeAll */

var dbHandler     = require("../dbHandler");
var Ad            = dbHandler.Ad;
var seedDatabase  = dbHandler.seedDatabase;
var clearDatabase = dbHandler.clearDatabase;

var apiHandler = require("../apiHandler");
var getAd      = apiHandler.getAd;
var pad        = apiHandler.pad;

describe("# Get Ad List", function(){
    
    /* The order: clearDatabase -> seedDatabase -> start test */
    beforeAll(function(done) {
        clearDatabase(function(){
            seedDatabase(done);
        });
    });
    
    it("/ Retrive all", function(done){
        getAd(0, function(returnedAds){
            //console.log("Returned Ads ");
            expect(returnedAds.length).toBe(6);
            done();
        });
    });
    
    it("/ Retrive random one ", function(done){
        const adrequest = {
            id      : undefined,
            method  : 'GET',
            url     : '/?tz=-540', 
            ip      : '1.1.1.1',  //not special ip
            date    : '20180422',
            time    : 1524368746912,
            timezone: '-540'
        }
        getAd(adrequest, function(returnedAds){
            //console.log("Returned Ads: " + returnedAds + "length: " + returnedAds.length) ;
            expect(returnedAds.length).toBe(1);
            done();
        });
    });
    
    /* Step1: use identifier to find the ad, and then find the id of the found ad */
    /* Step2: use the id and ip to request */
    /* Step3: test the identifier of the request and the identifier of the returned ad is the same */
    it("/ Retrive one with id (IP correct)", function(done){
        const adrequest = {
            id         : undefined,
            method     : 'GET',
            url        : '/?tz=-540', 
            ip         : '2.2.2.2',
            date       : '20180422',
            time       : 1524368746912,
            timezone   : '-540',
            identifier : "ad2"
        }

        getAd(adrequest, function(rad){
            adrequest.id = rad._id; 
            getAd(adrequest, function(returnedAd){
                expect(returnedAd.identifier).toBe(adrequest.identifier);
                done();
            });
        });
    });
    
    /* Step1: use identifier to find the ad, and then find the id of the found ad */
    /* Step2: use the id and ip to request */
    /* Step3: test the identifier of the request and the identifier of the returned ad is the same */
    it("/ Retrive one with id (IP incorrect)", function(done){
        const adrequest = {
            id         : undefined,
            method     : 'GET',
            url        : '/?tz=-540', 
            ip         : '199.99.99.99',  //wrong IP
            date       : '20180422',
            time       : 1524368746912,
            timezone   : '-540',
            identifier : "ad2"
        }
        
        getAd(adrequest, function(rad){
            adrequest.id = rad._id; 
            getAd(adrequest, function(returnedAd){
                expect(returnedAd).toBe(null);
                done();
            });
        });
    });
});