var mongoose   = require("mongoose");
mongoose.connect("mongodb://localhost/ad-database");
console.log("DB is connected.");
var adSchema = new mongoose.Schema({
    img: String, 
    url: String,
    ip: String, 
    timeStart: Number,
    timeDuration: Number,
    identifier: String    //for debugging
});
var Ad = mongoose.model("Ad", adSchema);  
//============================================================
/* obj1: time no limit (always shown) */
var obj1 = {
      img: "/sample1.png",
      url: "www.ad.com/1",
      ip: "1.1.1.1",
      timeStart: 0, 
      timeDuration: 99999999999999,
      identifier: "ad1"  //for debug
    };
/* obj2: time 0 (always not shown) */
var obj2 = {
      img: "/sample2.png",
      url: "www.ad.com/2",
      ip: "2.2.2.2",
      timeStart: 1588863781963, 
      timeDuration: 0,
      identifier: "ad2"  //for debug
    };
var obj3 = {
      img: "/sample3.png",
      url: "www.ad.com/3",
      ip: "3.3.3.3",
      timeStart: 1423980600000,
      timeDuration: 180000000000,
      identifier: "ad3"  //for debug
    };
var obj4 = {
      img: "/sample4.png",
      url: "www.ad.com/4",
      ip: "4.4.4.4",
      timeStart: 1500965447538, 
      timeDuration: 10000000,
      identifier: "ad4"  //for debug
    };
var obj5 = {
      img: "/sample5.png",
      url: "www.ad.com/5",
      ip: "5.5.5.5",
      timeStart: 1523265447538, 
      timeDuration: 8900000000,
      identifier: "ad5"  //for debug
    };
var obj6 = {
      img: "/sample6.png",
      url: "www.ad.com/6",
      ip: "6.6.6.6",
      timeStart: 1523962447538, 
      timeDuration: 6700000000,
      identifier: "ad6"  //for debug
    };
function seedDatabase(callback) {
    Ad.create(obj1, function(err, saved) {
        if (err) {
            console.log("DB error");
        } else {
            console.log("DB is seeded - 1.");
            Ad.create(obj2, function(err, saved) {
                if (err) {
                    console.log("DB error");
                } else {
                    console.log("DB is seeded - 2.");
                    Ad.create(obj3, function(err, saved) {
                        if (err) {
                            console.log("DB error");
                        } else {
                            console.log("DB is seeded - 3.");
                            Ad.create(obj4, function(err, saved) {
                                if (err) {
                                    console.log("DB error");
                                } else {
                                    console.log("DB is seeded - 4.");
                                    Ad.create(obj5, function(err, saved) {
                                        if (err) {
                                            console.log("DB error");
                                        } else {
                                            console.log("DB is seeded - 5.");
                                            Ad.create(obj6, function(err, saved) {
                                                if (err) {
                                                    console.log("DB error");
                                                } else {
                                                    console.log("DB is seeded - 6.");
                                                    if(callback!==undefined){
                                                      callback();
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

// function seedDatabase(callback){
//     Ad.create(obj1, function(err, saved){
//       if(err){
//           console.log("DB error");
//       }else{
//           console.log("DB is seeded - 1.");
//       }
//     });
    
//     Ad.create(obj2, function(err, saved){
//       if(err){
//           console.log("DB error");
//       }else{
//           console.log("DB is seeded - 2.");
//       }
//     });
    
//     Ad.create(obj3, function(err, saved){
//       if(err){
//           console.log("DB error");
//       }else{
//           console.log("DB is seeded - 3.");
//       }
//     });
    
//     Ad.create(obj4, function(err, saved){
//       if(err){
//           console.log("DB error");
//       }else{
//           console.log("DB is seeded - 4.");
//       }
//     });

//     Ad.create(obj5, function(err, saved){
//       if(err){
//           console.log("DB error");
//       }else{
//           console.log("DB is seeded - 5.");
//       }
//     });
    
//     Ad.create(obj6, function(err, saved){
//       if(err){
//           console.log("DB error");
//       }else{
//           console.log("DB is seeded - 6.");
//       }
//     });
// }

function clearDatabase(callback){
    Ad.remove({}, function(err){
       if(err){
            console.log(err);
       }else{
            console.log("DB is cleared.");
            if(callback!==undefined){
              callback();
            }
       }
    });
}

module.exports = {
    Ad: Ad, 
    seedDatabase: seedDatabase, 
    clearDatabase: clearDatabase
};