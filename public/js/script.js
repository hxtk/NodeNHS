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
        var hei = this.parentNode.style.height;
        window.setTimeout(function(hei){
            hei = '46px';
        },5);
    };
});