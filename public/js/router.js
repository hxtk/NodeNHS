/**
 * Created by peter on 7/2/15.
 */
var nhs = angular.module('app', ['ngRoute','angular-jwt']);

nhs.config(function($routeProvider){
   $routeProvider
       .when('/',{
           templateUrl : 'partials/news.html',
           controller : 'newsCtl'
       })
       .when('/news',{
           templateUrl : 'partials/news.html',
           controller : 'newsCtl'
       })
       .when('/group',{
           templateUrl : 'partials/group.html',
           controller : 'groupCtl'
       })
       .when('/u/:param',{
           templateUrl : 'partials/user.html',
           controller : 'userCtl'
       });
});