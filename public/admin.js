/* global $ */
$(document).ready(function(){
    //alert("admin.js loaded.");
});

$('#btnSubmit').click(function(){
    var newAd = { 
            img: $('#img').val(), 
            url: $('#url').val(),
            ip : $('#ip').val(), 
            timeStart   : $('#timeStart').val(),
            timeDuration: $('#timeDuration').val()
    };
    //console.log("click");
    //console.log("img: " + $('#myimg').val());
    //console.log("url: " + $('#myurl').text());
    //console.log(newAd);
    
    /* post an ad */
    $.ajax({
        type: "POST",
        url:  "/api/v1/ads",
        data: JSON.stringify(newAd),  //handle the jsonify on our own instead of jquery
        processData: false
        //contentType: "application/json"
    })
    .then(function(res){
        console.log(res);
        $('#img').val(); 
        $('#url').val();
        $('#ip').val();
        $('#timeStart').val();
        $('#timeDuration').val();
        alert(res);
    });
});