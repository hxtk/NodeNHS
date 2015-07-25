
//https://ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular.min.js

$(document).ready(function(){

    $("body").click(function () {
        if($("#search input").is(":focus") || $("#search").is(":focus")) {
            $("#search").css({height: "auto"});
        }else {
            $("#search").css({height: "46px"});
        }
    });
    $(".nav").click(function(){
        $(".nav").removeClass("active");
        $(this).addClass("active");
    });

});