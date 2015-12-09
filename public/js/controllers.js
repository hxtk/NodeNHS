var app = angular.module('app');

var token;

app.factory('socket', function ($rootScope) {
    var socket = io();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});
app.factory('toast', function(){
    humane.info = humane.spawn({ addnCls: 'humane-flatty-info', timeout: 5000 });
    humane.error = humane.spawn({addnCls: 'humane-flatty-error',timeout: 2000 });
    return function(data){
        if(!data.type){
            humane.log(data.msg);
            return;
        }
        if(data.type=='error'){
            humane.error(data.msg);
        }else if(data.type=='info'){
            humane.info(data.msg);
        }else{
            humane.log(data.msg);
        }
    };
});
app.factory('markd', function(){
    return function(mdstring){
        return marked(mdstring,{
            sanitize : true,
            smartypants : true,
            tables : false,
            breaks : false
        });
    };
});


app.controller('mainCtl', ['$http', '$scope', '$rootScope', function($http, $scope, $rootScope){
    $scope.token = $rootScope.token;
    $scope.vanish = function(arr){
        for(var i= 0,l=arr.length; i<l;i++){
            arr[i].style.display = 'none';
        }
    };
    switch($scope.token.perms){
        case 0:
            $scope.vanish(document.querySelectorAll(".perm-1"));
            $scope.vanish(document.querySelectorAll(".perm-2"));
            $scope.vanish(document.querySelectorAll(".perm-3"));
            $scope.vanish(document.querySelectorAll(".perm-4"));
            break;
        case 1:
            $scope.vanish(document.querySelectorAll(".perm-2"));
            $scope.vanish(document.querySelectorAll(".perm-3"));
            $scope.vanish(document.querySelectorAll(".perm-4"));
            $scope.vanish(document.querySelectorAll(".g"));
            break;
        case 2:
            $scope.vanish(document.querySelectorAll(".perm-3"));
            $scope.vanish(document.querySelectorAll(".perm-4"));
            $scope.vanish(document.querySelectorAll(".g"));
            break;
        case 3:
            $scope.vanish(document.querySelectorAll(".perm-4"));
            $scope.vanish(document.querySelectorAll(".g"));
            break;
        case 4:
            $scope.vanish(document.querySelectorAll(".g"));
            break;
    }
}]);

app.controller('logCtl', ['$http', '$scope', '$rootScope', 'toast', function($http,$scope,$rootScope,toast){
    $scope.log_in = function(){
        $http.post('/auth/token', {email:$scope.email,password:$scope.password})
            .success(function(data, status, headers, config) {
                if(data.error){
                    toast({type:'error',msg:data.error});
                    return;
                }else if(data.info){
                    toast({type: 'info', msg:data.info});
                    return;
                }
                localStorage.setItem('token',data.token);
                if($rootScope.goto) location.assign($rootScope.goto);
                else location.reload();

            })
            .error(function(data, status, headers, config) {
                toast({type:'info',msg:'Something went wrong!'});
                console.log(data + '\n' + status + '\n' + headers + '\n' + config);
            });
    };
}]);

app.controller('registerCtl', ['$http', '$scope', '$rootScope', 'toast', function($http,$scope,$rootScope,toast){
    $scope.register = function(){
        if(!$scope.name || !$scope.email || !$scope.cemail || !$scope.password || !$scope.cpassword || !$scope.year){
            toast({type:'info',msg:'must fill in all fields'});
            console.log([$scope.name,$scope.email,$scope.cemail,$scope.password,$scope.cpassword,$scope.year]);
            return null;
        }
        if($scope.name == "" || $scope.email == "" || $scope.cemail == "" || $scope.password == "" || $scope.cpassword == "" || $scope.year == ""){
            toast({type:'info',msg:'must fill in all fields'});
            return null;
        }
        if($scope.email != $scope.cemail){
            toast({type:'info',msg:'mismatched emails'});
            return null;
        }
        if($scope.password != $scope.cpassword){
            toast({type:'info',msg:'mismatched passwords'});
            return null;
        }
        $http.post('/api/user', {
            email:$scope.email,
            password:$scope.password,
            name:$scope.name,
            year:$scope.year
        })
            .success(function(data, status, headers, config) {
                if(data.error){
                    console.log(data.error);
                    toast(data.error);
                    return;
                }
                console.log(data);
                localStorage.setItem('token',data.token);
                location.reload();

            })
            .error(function(data, status, headers, config) {
                toast({type:'info',msg:'something went wrong!'});
            });
    };
}]);

app.controller('searchCtl', ['$scope', '$http', function ($scope, $http){
    $scope.getsearch = function() {
        if ($scope.query.length > 0) {
            $http.get('/api/search?q=' + $scope.query)
                .success(function (res) {
                    $scope.results = res;
                });
        } else {
            $scope.results = [];
        }
    }
}]);

app.controller('newsCtl', ['$scope', '$http', '$sce', function ($scope, $http, $sce){
    $http.get('/api/news')
        .success(function(res){
            $scope.articles = res;
            for(var i = 0; i < $scope.articles.length; i++){
                $scope.articles[i].body = $sce.trustAsHtml($scope.articles[i].body);
            }
        });
}]);

app.controller('chatCtl', ['$scope', '$http', '$sce', 'socket', 'toast', 'markd', function ($scope, $http, $sce, socket, toast, markd){
    $scope.messages = [];
    $scope.ding = new Audio('/wav/ding.wav');
    $http.get('/api/chat')
        .success(function (res) {
            if(res.error){
                toast(res.error);
            }
            for(var i = 0; i < res.length; i++){
                res[i].message = $sce.trustAsHtml(res[i].message);
                if(res[i].sender.id == $scope.token.id) res[i].sender.name = "You";
            }
            $scope.messages = res;
        });
    $scope.submit = function(){
        var m = $scope.message;
        if(m != '') {
            $scope.message = '';
            $scope.messages.unshift({
                sender: {
                    name: "You",
                    id: $scope.token.id
                },
                message: $sce.trustAsHtml(markd(m))
            });

            socket.emit('msg', {
                sender: {
                    name: $scope.token.name,
                    id: $scope.token.id
                },
                message: m,
                token: localStorage.getItem('token')
            });
        }
    };
    socket.on('msg',function(data){
        if(data.sender.id == $scope.token.id) data.sender.name = "You";
        data.message = $sce.trustAsHtml(data.message);
        $scope.messages.unshift(data);
        if(!document.hasFocus() && data.sender.id != $scope.token.id) $scope.ding.play();
    });
    socket.on('toast',function(data){
        toast(data);
    });
}]);

app.controller('userCtl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams){
    $http.get('/api/user/' + $routeParams.id)
        .success(function(res){
            $scope.user = res;
            $scope.events = [];
        });
}]);