/**
 * Created by peter on 7/2/15.
 */

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {

        var k;

        // 1. Let O be the result of calling ToObject passing
        //    the this value as the argument.
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }

        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get
        //    internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If len is 0, return -1.
        if (len === 0) {
            return -1;
        }

        // 5. If argument fromIndex was passed let n be
        //    ToInteger(fromIndex); else let n be 0.
        var n = +fromIndex || 0;

        if (Math.abs(n) === Infinity) {
            n = 0;
        }

        // 6. If n >= len, return -1.
        if (n >= len) {
            return -1;
        }

        // 7. If n >= 0, then Let k be n.
        // 8. Else, n<0, Let k be len - abs(n).
        //    If k is less than 0, then let k be 0.
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        // 9. Repeat, while k < len
        while (k < len) {
            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the
            //    HasProperty internal method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            //    i.  Let elementK be the result of calling the Get
            //        internal method of O with the argument ToString(k).
            //   ii.  Let same be the result of applying the
            //        Strict Equality Comparison Algorithm to
            //        searchElement and elementK.
            //  iii.  If same is true, return k.
            if (k in O && O[k] === searchElement) {
                return k;
            }
            k++;
        }
        return -1;
    };
}

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
        },
        register : {
            templateUrl : 'partials/register.html',
            controller : 'registerCtl'
        },
        verify : {
            templateUrl : 'partials/verify.html',
            controller : 'verifyCtl'
        },
        reset : {
            templateUrl : 'partials/reset.html',
            controller : 'resetCtl'
        }
    };
    $routeProvider
        .when('/',routes.news)
        .when('/news',routes.news)
        .when('/group',routes.group)
        .when('/u/:id',routes.user)
        .when('/chat',routes.chat)
        .when('/login',routes.login)
        .when('/login/:token',routes.login)
        .when('/register',routes.register)
        .when('/verify',routes.verify)
        .when('/reset',routes.reset)
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
    var plist = [
        [
            '/',
            '/login',
            '/news',
            '/register',
            '/verify',
            '/reset'
        ],
        [
            '/',
            '/news',
            '/u',
            '/chat',
            '/group',
            '/login',
            '/register',
            '/verify',
            '/reset'
        ],
        [
            '/',
            '/news',
            '/u',
            '/chat',
            '/group',
            '/login',
            '/register',
            '/verify',
            '/reset'
        ],
        [
            '/',
            '/news',
            '/u',
            '/chat',
            '/group',
            '/login',
            '/register',
            '/verify',
            '/reset'
        ],
        [
            '/',
            '/news',
            '/u',
            '/chat',
            '/group',
            '/login',
            '/register',
            '/verify',
            '/reset'
        ]
    ];
    $rootScope.plist = [];
    for(var i = 0; i < plist.length; i++)
        $rootScope.push(plist[i][0]);

    // register listener to watch route changes
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {

        var testStr = $location.path();
        if(testStr.indexOf('/',1) > 0) testStr = testStr.substring(0,testStr.indexOf('/',1));

        if(plist[p].indexOf(testStr) == -1){
            humane.error = humane.spawn({ addnCls: 'humane-flatty-error', timeout: 1000 })
            humane.error("You don't have permission to do that.");
            $location.path(plist[p][0]);
        }
    });
});