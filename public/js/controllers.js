var app = angular.module('app');

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
app.controller('newsCtl', ['$scope', '$http', function ($scope, $http){
    $http.get('/api/news')
        .success(function(res){
            $scope.articles = res;
        });
    $('.content').readmore({
        moreLink: '<a href="javascript:;">Read more</a>',
        lessLink: '<a href="javascript:;">Close</a>'
    });
}]);