angular.module('starter.controllers', [])

  .controller('AuthenticationController', function ($scope, $state, $cordovaToast, AuthenticationService) {
    $scope.user = {
      username: null,
      password: null
    };

    if (AuthenticationService.getAuthorization() != null) {
      AuthenticationService.populateUser().then(function (response) {
        response = response.data;
        if (response.success) {
          AuthenticationService.setCurrentUser(response.data);
          $state.go('tab.dash');
        } else {
          $cordovaToast.showLongBottom(response.message);
        }
      }, function (error) {
        //TODO
      });
    }

    $scope.login = function () {
      AuthenticationService.signIn($scope.user).then(function (response) {
        response = response.data;
        if (response.success) {
          AuthenticationService.setCurrentUser($scope.user);
          AuthenticationService.setAuthorization(response.data.token);
          $state.go('tab.dash');
        } else {
          $cordovaToast.showLongBottom(response.message);
        }
      }, function (error) {
        $cordovaToast.showLongBottom("ErrorMessage::Login");
      });
    };

    $scope.register = function () {
      AuthenticationService.register($scope.user).then(function (response) {
        response = response.data;
        if (response.success) {
          $scope.login($scope.user);
        } else {
          $cordovaToast.showLongBottom(response.message);
        }
      }, function (error) {
        $cordovaToast.showLongBottom("ErrorMessage::Register");
      });
    };

    $scope.logout = function () {
      AuthenticationService.logout($scope.user).then(function (response) {
        AuthenticationService.setCurrentUser(null);
        $state.go('login');
      });
    };

    $scope.showRegistrationPage = function () {
      $state.go('register');
    };
  })

  .controller('DashboardController', function ($scope, $state, $cordovaToast, $ionicPopup, DashboardService) {
    $scope.showTable = false;
    $scope.code = null;
    $scope.searchResult = null;
    $scope.table = {
      code: null
    };
    $scope.data = {};

    $scope.enterCode = function () {
      DashboardService.getTable($scope.code).then(function (response) {
        response = response.data;
        if (response.success) {
          $scope.table = response.data;
          $scope.showTable = true;
        } else {
          $cordovaToast.showShortCenter(response.message);
        }
      }, function (error) {
        $cordovaToast.showShortCenter("ErrorMessage::GetTable");
      });
    };

    $scope.setAmount = function (selectedUserIndex, amount) {
      var user = $scope.table.users[selectedUserIndex];
      DashboardService.setAmount(user.email, amount).then(function (response) {
        response = response.data;
        if (response.success) {
          //Service should return updated amount only !
          $scope.table.users[selectedUserIndex].amount = response.data;
        } else {
          $cordovaToast.showShortCenter(response.message);
        }
      }, function (error) {
        $cordovaToast.showShortCenter("ErrorMessage::SetAmount")
      });
    };

    $scope.searchUser = function (query) {
      $scope.searchInProgress = true;
      DashboardService.searchUser(query).then(function (response) {
        response = response.data;
        $scope.searchInProgress = false;
        if (response.success) {
          $scope.searchResult = response.data;
        } else {
          $cordovaToast.showShortBottom(response.message);
        }
      }, function (error) {
        $cordovaToast.showShortBottom("ErrorMessage::SearchUser");
      });
    };

    $scope.addUserToTable = function (userId) {
      var result = null;
      for (elem in $scope.searchResult) {
        if (elem.id == userId) {
          result = elem;
        }
      }
      $scope.searchResult = [];

      DashboardService.addUserToTable(userId).then(function (response) {
        response = response.data;
        if (response.success) {
          $scope.table = response.data;
        } else {
          $cordovaToast.showShortBottom(response.message);
        }
      }, function (error) {
        $cordovaToast.showShortBottom("ErrorMessage::AddUser");
      });

    };

    $scope.editAmount = function (selectedUserIndex) {
      $ionicPopup.show({
        template: '<input type="text" ng-model="data.amount">',
        title: 'Yeni miktari giriniz',
        subTitle: 'Örn. 10.21',
        scope: $scope,
        buttons: [
          {text: 'İptal'},
          {
            text: '<b>Kaydet</b>',
            type: 'button-positive',
            onTap: function (e) {
              if (!$scope.data.amount) {
                //don't allow the user to close unless he enters wifi password
                e.preventDefault();
              } else {
                $scope.setAmount(selectedUserIndex, $scope.data.amount);
                return;
              }
            }
          }
        ]
      });
    };

  })

  .controller('HistoryController', function ($scope, $stateParam) {
  })

  .controller('AccountCtrl', function ($scope) {
    $scope.settings = {
      enableFriends: true
    };
  });
