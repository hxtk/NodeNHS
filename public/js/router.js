/**
 * Created by peter on 7/2/15.
 */
var nhs = angular.module('nhs', ['ngRoute']);

nhs.config(function($routeProvider){
   $routeProvider
       .when('/',{
           templateUrl : 'partials/news.html',
           controller : 'newsCtl'
       })
       .when('/group',{
           templateUrl : 'partials/group.html',
           controller : 'groupCtl'
       })
       .when('/admin',{

       })
});