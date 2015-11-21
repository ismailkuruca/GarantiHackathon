angular.module('starter.services', [])

  .factory('$localStorage', ['$window', function($window) {
    return {
      set: function(key, value) {
        $window.localStorage[key] = value;
      },
      get: function(key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      setObject: function(key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function(key) {
        return JSON.parse($window.localStorage[key] || '{}');
      }
    }
  }])

  .service('AuthenticationService', function ($http, $localStorage) {
    var currentUser = null;
    var authorization = null;
    this.signIn = function (user) {
      return $http({
        url: window.backendUrl + 'login',
        method: 'post',
        params: {
          username: user.username,
          password: user.password
        }
      });
    };

    this.register = function (user) {
      return $http({
        url: window.backendUrl + 'register',
        method: 'post',
        params: {
          username: user.username,
          password: user.password
        }
      });
    };

    this.populateUser = function () {
      return $http({
        url: window.backendUrl + 'secure/me',
        method: 'get'
      });
    };

    this.setCurrentUser = function (user) {
      this.currentUser = user;
    };

    this.getCurrentUser = function () {
      return this.currentUser;
    };

    this.setAuthorization = function (auth) {
      this.authorization = auth;
      window.localStorage["gh-auth"] = auth;
      $http.defaults.headers.common['Authorization'] = "Bearer: " + window.localStorage["gh-auth"].replace(/^"(.*)"$/, '$1');
    };

    this.getAuthorization = function () {
      if (!this.authorization) {
        this.authorization = window.localStorage["gh-auth"];
      }
      return this.authorization;
    };

    this.logout = function () {
      window.localStorage["gh-auth"] = null;
    };
  })

  .service('DashboardService', function ($http) {
    var data = null;
    this.getTable = function (code) {
      return $http.get(window.backendUrl + 'secure/getBillByUserCode?code=' + code.toUpperCase());
    };

    this.setData = function (data) {
      this.data = data;
    };

    this.getData = function () {
      return this.data;
    };

    this.addUserToTable = function (userId, code) {
      return $http({
        url: window.backendUrl + 'secure/addContributerToBillByBillCode',
        method: 'POST',
        params: {
          customerid: userId,
          userCode: code.toUpperCase()
        }
      });
    };

    this.searchUser = function (query) {
      return $http.get(window.backendUrl + 'secure/searchUser?username=' + query);
    };

    this.saveCreditCard = function (number, month, year, cvc2) {
      return $http({
        url: window.backendUrl + 'secure/addCreditCard',
        method: 'post',
        params: {
          number: number,
          expireMonth: month,
          expireYear: year,
          cvv: cvc2
        }
      });
    };

    this.getCreditCardList = function() {
      return $http.get(window.backendUrl + 'secure/getCreditCards');
    };

    this.setAmount = function(contributionId, amount) {
      return $http({
        url: window.backendUrl + 'secure/updateContribution',
        method: 'post',
        params: {
          contributionid: contributionId,
          contribution: amount
        }
      });
    };

    this.makePayment = function(code, creditCardId) {
      return $http({
        url: window.backendUrl + 'secure/confirmContributionWithDefinedCreditCard',
        method: 'post',
        params: {
          creditCardid: creditCardId,
          userCode: code
        }
      });
    };
  })

  .factory('Chats', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var chats = [{
      id: 0,
      name: 'Ben Sparrow',
      lastText: 'You on your way?',
      face: 'img/ben.png'
    }, {
      id: 1,
      name: 'Max Lynx',
      lastText: 'Hey, it\'s me',
      face: 'img/max.png'
    }, {
      id: 2,
      name: 'Adam Bradleyson',
      lastText: 'I should buy a boat',
      face: 'img/adam.jpg'
    }, {
      id: 3,
      name: 'Perry Governor',
      lastText: 'Look at my mukluks!',
      face: 'img/perry.png'
    }, {
      id: 4,
      name: 'Mike Harrington',
      lastText: 'This is wicked good ice cream.',
      face: 'img/mike.png'
    }];

    return {
      all: function () {
        return chats;
      },
      remove: function (chat) {
        chats.splice(chats.indexOf(chat), 1);
      },
      get: function (chatId) {
        for (var i = 0; i < chats.length; i++) {
          if (chats[i].id === parseInt(chatId)) {
            return chats[i];
          }
        }
        return null;
      }
    };
  });
