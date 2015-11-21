var backendUrl = "http://garanti-hackathon.eu-gb.mybluemix.net/";
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova', 'ngCookies'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

  .run(['$http', '$cookies', function ($http, $localStorage) {
    if(window.localStorage["gh-auth"]) {
      $http.defaults.headers.common['Authorization'] = "Bearer: " + window.localStorage["gh-auth"].replace(/^"(.*)"$/, '$1');
    }
  }])

  .
  config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    $ionicConfigProvider.backButton.previousTitleText(false);
    $ionicConfigProvider.backButton.text("Geri");
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

      // setup an abstract state for the tabs directive
      // Each tab has its own nav history stack:

      .state('dash', {
        url: '/dash',
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashboardController'
      })

      .state('table', {
        url: '/table/:code',
        templateUrl: 'templates/table.html',
        controller: 'TableController'
      })

      .state('settlement', {
        url: '/settlement/:code',
        templateUrl: 'templates/settlement.html',
        controller: 'SettlementController'
      })

      .state('settings', {
        url: '/settings',
        templateUrl: 'templates/tab-settings.html',
        controller: 'SettingsController'
      })
      .state('history', {
        url: '/history',
        templateUrl: 'templates/tab-history.html',
        controller: 'HistoryController'
      })

      .state('account', {
        url: '/account',
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      })

      .state('register', {
        url: '/register',
        templateUrl: 'templates/register.html',
        controller: 'AuthenticationController'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'AuthenticationController'
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

  });
