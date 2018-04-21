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
    it("Retrive all", function(done){
        getAd(0, function(returnedAds){
            console.log("Returned Ads ");
            expect(returnedAds.length).toBe(6);
            done();
        });
    });
});