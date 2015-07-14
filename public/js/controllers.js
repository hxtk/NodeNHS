var app = angular.module('app');

app.controller('mainCtl', ['$http', '$scope', 'jwtHelper', function($http, $scope, jwtHelper){
    if(localStorage.token){
        $http.defaults.headers.common.Authorization = "Bearer " + localStorage.token;
        $scope.token = jwtHelper.decodeToken(localStorage.token);
    }
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