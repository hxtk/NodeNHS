function ready(fn) {
    if (document.readyState != 'loading'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function reheight(el,h){
    style.height = h;
}

ready(function() {
    document.querySelector("#search input").onfocus = function () {
        this.parentNode.style.height = 'auto';
    };
    document.querySelector("#search input").onblur = function () {
        var hei = this.parentNode.
        window.setTimeout(reheight(this.parentNode,'46px'),5);
    };
});