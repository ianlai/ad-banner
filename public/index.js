/* global $ */
$(document).ready(function(){
    var timezone = new Date().getTimezoneOffset();
    /* get the ad */
    $.getJSON('/api/v1/ads',
    {
        tz: timezone   
    })
    .then(function(res){
        
        /* show the ad */
        $('#img').text(res.img);
        $('#url').text(res.url);
    });
});