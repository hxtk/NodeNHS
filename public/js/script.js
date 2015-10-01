function ready(fn) {
    if (document.readyState != 'loading'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function reheight(el,h){
    el.style.height = h;
}

ready(function() {
    document.querySelector("#search input").onfocus = function () {
        this.parentNode.style.height = 'auto';
    };/*
    document.querySelector("#search input").onblur = function () {
        window.setTimeout(5000,reheight(this.parentNode,'46px'));
    };*/
    document.getElementById('search').onclick = function(){
        return false;
    };
    document.body.onclick = function(){
        reheight(document.getElementbyId("search"),'46px');
    };

});