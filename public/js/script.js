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
    document.onclick = function(e){
        if(isDescendant(e.target,document.getElementById("search"))){
            j = document.getElementsByName("search");
            reheight(j,'auto');
            if(g.clientHeight > document.body.clientHeight){
                reheight(j,document.body.clientHeight - 100 + 'px');
                j.style.overflowY = 'scroll';
            }

        }else{
            reheight(document.getElementById("search"),'46px');
        }
    }
});