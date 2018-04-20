var mongoose   = require("mongoose");
mongoose.connect("mongodb://localhost/ad-database");
var adSchema = new mongoose.Schema({
    img: String, 
    url: String,
    ip: String, 
    timeStart: Number,
    timeDuration: Number,
    showCount: Number    //not implemented yet
});
var Ad = mongoose.model("Ad", adSchema);  
//============================================================
function seedDatabase(){
    Ad.create({
      img: "/sample1.png",
      url: "www.ad.com/1",
      ip: "101.0.0.1",
      timeStart: 1523963781963, 
      timeDuration: 1000000
    }, function(err, saved){
      if(err){
          console.log("DB error");
      }else{
          console.log("DB is seeded - 1.");
      }
    });
    
    Ad.create({
      img: "/sample2.png",
      url: "www.ad.com/2",
      ip: "102.0.0.1",
      timeStart: 1588863781963, 
      timeDuration: 800000000
    }, function(err, saved){
      if(err){
          console.log("DB error");
      }else{
          console.log("DB is seeded - 2.");
      }
    });
    
    Ad.create({
      img: "/sample3.png",
      url: "www.ad.com/3",
      ip: "103.0.0.1",
      timeStart: 1423980600000,
      timeDuration: 180000000000,
    }, function(err, saved){
      if(err){
          console.log("DB error");
      }else{
          console.log("DB is seeded - 3.");
      }
    });
    
    Ad.create({
      img: "/sample4.png",
      url: "www.ad.com/4",
      ip: "104.0.0.1",
      timeStart: 1500965447538, 
      timeDuration: 10000000
    }, function(err, saved){
      if(err){
          console.log("DB error");
      }else{
          console.log("DB is seeded - 4.");
      }
    });

    Ad.create({
      img: "/sample5.png",
      url: "www.ad.com/5",
      ip: "105.0.0.1",
      timeStart: 1523965447538, 
      timeDuration: 1000000000
    }, function(err, saved){
      if(err){
          console.log("DB error");
      }else{
          console.log("DB is seeded - 5.");
      }
    });
}

function clearDatabase(){
    Ad.remove({}, function(err){
       if(err){
           console.log(err);
       }else{
           console.log("DB is cleared.");
       }
    });
}

module.exports = {
    Ad: Ad, 
    seedDatabase: seedDatabase, 
    clearDatabase: clearDatabase
}