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
app.factory('toast', function($rootScope){
    return {
        clear: function(){
            $rootScope.toast = [];
        },
        add: function(ts,ti,tx){
            $rootScope.toast.push({type:ts,title:ti,msg:tx});
        },
        rem: function(){
            $rootScope.toast.pop();
        }
    }
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

app.controller('logCtl', ['$http', '$scope', '$rootScope', function($http,$scope,$rootScope){
    $scope.log_in = function(){
        $http.post('/auth/token', {email:$scope.email,password:$scope.password})
            .success(function(data, status, headers, config) {
                if(data.error){
                    console.log(data.error);
                    //toast({type:'error',title:'Auth Error',msg:data.error});
                    return;
                    // TODO: Make toast notifications
                }
                localStorage.setItem('token',data.token);
                if($rootScope.goto) location.assign($rootScope.goto);
                else location.reload();

            })
            .error(function(data, status, headers, config) {
                // Toast here
            });
    };
}]);

app.controller('registerCtl', ['$http', '$scope', '$rootScope', function($http,$scope,$rootScope){
    $scope.register = function(){
        if($scope.name == "" || $scope.email == "" || $scope.cemail == "" || $scope.password == "" || $scope.cpassword == "" || $scope.year == ""){
            // Toast "must fill in all fields"
            return null;
        }
        if($scope.email != $scope.cemail){
            // Emails don't match
            return null;
        }
        if($scope.password != $scope.cpassword){
            // Passwords don't match
            return null;
        }
        $http.post('/api/user', {
            email:$scope.email,
            password:$scope.password,
            name:$scope.name,
            class:$scope.year
        })
            .success(function(data, status, headers, config) {
                if(data.error){
                    console.log(data.error);
                    //toast({type:'error',title:'Auth Error',msg:data.error});
                    return;
                    // TODO: Make toast notifications
                }
                localStorage.setItem('token',data.token);
                if($rootScope.goto) location.assign($rootScope.goto);
                else location.reload();

            })
            .error(function(data, status, headers, config) {
                // Toast here
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

app.controller('chatCtl', ['$scope', '$http', 'socket', function ($scope, $http, socket){
    $scope.messages = [];
    $scope.ding = new Audio('/wav/ding.wav');
    $http.get('/api/chat')
        .success(function (res) {
            for(var i = 0; i < res.length; i++){
                if(res[i].sender.id == $scope.token.id) res[i].sender.name = "You";
            }
            if(!res.error) $scope.messages = res;
            else console.log(res.error); //toast(res.error);
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
                message: m
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
        $scope.messages.unshift(data);
        if(!document.hasFocus() && data.sender.id != $scope.token.id) $scope.ding.play();
    });
}]);

app.controller('userCtl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams){

}]);