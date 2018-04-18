/* global $ */
$(document).ready(function(){
    //alert("index.js loaded.");
    var timezone = new Date().getTimezoneOffset();
    console.log("[index.js]" + timezone);
    /* get the ad */
    $.getJSON('/',
    {
        tz: timezone   
    })
    .then(function(res){
        console.log(res[0].img);
        /* show the ad */
        res.forEach(function(e){
            $('#banner').append(e.img);
            $('#banner').append('  --  ');
            $('#banner').append(e.url);
            $('#banner').append('\n');
        })
    });
});