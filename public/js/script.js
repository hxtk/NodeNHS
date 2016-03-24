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
            j = document.getElementById("search");
            reheight(j,'auto');
            if(j.scrollHeight > window.innerHeight){
                console.log(j.lastElementChild);
                j.lastElementChild.style.height = '300px';
                j.lastElementChild.style.overflowY = 'scroll';
            }

        }else{
            reheight(document.getElementById("search"),'46px');
        }
    }
});