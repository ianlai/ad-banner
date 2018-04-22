/* global $ */
$('#btnSubmit').click(function(){
    var newAd = { 
            img: $('#img').val(), 
            url: $('#url').val(),
            ip : $('#ip').val(), 
            timeStart   : $('#timeStart').val(),
            timeDuration: $('#timeDuration').val()
    };

    /* post an ad */
    $.ajax({
        type: "POST",
        url:  "/api/v1/ads",
        data: JSON.stringify(newAd),  //handle the jsonify on our own instead of jQuery
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