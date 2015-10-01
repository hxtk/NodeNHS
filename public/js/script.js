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

        window.setTimeout(function(){
            this.parentNode.style.height = '46px';
        },5);
    };
});