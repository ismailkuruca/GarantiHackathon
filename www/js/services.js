angular.module('starter.services', [])

  .service('AuthenticationService', function ($http, $cookies) {
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
      $cookies.put("gh-auth", auth);
    };

    this.getAuthorization = function () {
      if (!this.authorization) {
        this.authorization = $cookies.get("gh-auth");
      }
      return this.authorization;
    };

    this.logout = function () {
      $cookies.remove("gh-auth");
    };
  })

  .service('DashboardService', function ($http) {

    this.getTable = function (code) {
      return $http({
        url: '', //TODO
        method: 'post',
        params: {
          code: code
        }
      })
    };

    this.addUserToTable = function (userId) {
      return $http({
        url: '', //TOOD
        method: 'POST',
        params: {
          userId: userId
        }
      });
    };

    this.searchUser = function (query) {
      return $http.get(window.backendUrl + 'secure/searchUser?username=' + query);
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
