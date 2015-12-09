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
function isDescendant(el,q){
    if(el == null) return false;
    if(el == q) return true;
    return isDescendant(el.parentNode,q);
}

ready(function() {
    document.getElementById("input").onblur = function(){
        document.getElementById("input").value = "";
    }
    document.onclick = function(e){
        if(isDescendant(e.target,document.getElementById("search"))){
            reheight(document.getElementById("search"),'auto');
        }else{
            reheight(document.getElementById("search"),'46px');
        }
    }

});