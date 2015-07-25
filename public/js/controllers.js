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

app.controller('mainCtl', ['$http', '$scope', '$rootScope', function($http, $scope, $rootScope){
    $scope.token = $rootScope.token;
}]);

app.controller('logCtl', ['$http', '$scope', function($http,$scope){
    $scope.log_in = function(){
        $http.post('/auth/token', {email:$scope.email,password:$scope.password}).
            success(function(data, status, headers, config) {
                if(data.error){
                    console.log(data.error);
                    //toast({type:'error',title:'Auth Error',msg:data.error});
                    return;
                    // TODO: Make toast notifications
                }
                localStorage.setItem('token',data.token);
                location.reload();
            }).
            error(function(data, status, headers, config) {

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

app.controller('chatCtl', ['$scope', '$http', 'socket', '$rootScope', function ($scope, $http, socket, $rootScope){
    $scope.messages = [];
    $http.get('/api/chat')
        .success(function (res) {
            for(var i = 0; i < res.length; i++){
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
                message: m
            });
            socket.emit('msg', {
                sender: {
                    name: $scope.token.name,
                    id: $scope.token.id
                },
                message: m,
                token: $rootScope.token
            });
        }
    };
    socket.on('msg',function(data){
        $scope.messages.unshift(data);
    });
}]);

