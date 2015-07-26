
//https://ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular.min.js
function ready(fn) {
    if (document.readyState != 'loading'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(function() {
    document.querySelector("#search input").onfocus = function () {
        this.parentNode.style.height = 'auto';
    };
    document.querySelector("#search input").onblur = function () {
        this.parentNode.style.height = '46px';
    };
});
/*
$(document).ready(function(){
    $(".nav").click(function(){
        $(".nav").removeClass("active");
        $(this).addClass("active");
    });

});
*/