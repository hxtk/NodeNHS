/**
 * Created by peter on 7/2/15.
 */
var nhs = angular.module('app', ['ngRoute','angular-jwt']);

nhs.config(function($routeProvider){
    var routes = {
        news : {
            templateUrl : 'partials/news.html',
            controller : 'newsCtl'
        },
        user : {
            templateUrl : 'partials/user.html',
            controller : 'userCtl'
        },
        chat : {
            templateUrl : 'partials/chat.html',
            controller : 'chatCtl'
        },
        group : {
            templateUrl : 'partials/group.html',
            controller : 'groupCtl'
        },
        login : {
            templateUrl : 'partials/login.html',
            controller : 'logCtl'
        }
    };
    $routeProvider
        .when('/',routes.news)
        .when('/news',routes.news)
        .when('/group',routes.group)
        .when('/u/:param',routes.user)
        .when('/chat',routes.chat)
        .when('/login',routes.login)
});

nhs.run(function($rootScope,$http,jwtHelper){
    if(localStorage.token){
        $http.defaults.headers.common.Authorization = "Bearer " + localStorage.getItem('token');
        $rootScope.token = jwtHelper.decodeToken(localStorage.getItem('token'));

    }else{
        $rootScope.token = {
            perms: 0,
            title: 'Guest'
        }
    }
});

nhs.run( function($rootScope, $location) {
    var p = $rootScope.token.perms;
    plist = [
        [
            '/login',
            '/news',
            '/register'
        ],
        [
            '/news',
            '/u',
            '/chat',
            '/g'
        ],
        [
            '/news',
            '/u',
            '/chat',
            '/g'
        ],
        [
            '/news',
            '/u',
            '/chat',
            '/g'
        ],
        [
            '/news',
            '/u',
            '/chat',
            '/g'
        ]
    ];
    // register listener to watch route changes
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
        if(plist[p].indexOf($location.path()) == -1){
            //TODO: make toast notifications
            //toast({type:'warn',title:'Auth Error',msg:"You don't have permission to do that!"});
            $location.path(plist[p][0]);
        }
    });
});