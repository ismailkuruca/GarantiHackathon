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
    $scope.elems = [];

    var diameter = document.getElementById('search-bar').offsetWidth;

    var svg = d3.select('#chart').append('svg')
      .attr('width', diameter)
      .attr('height', diameter * 1.2);

    var bubble = d3.layout.pack()
      .size([diameter, diameter])
      .value(function (d) {
        return d.size;
      }) // new data is loaded to bubble layout
      .padding(3);


    function drawBubbles(m) {

      // generate data with calculated layout values
      var nodes = bubble.nodes({children: m})
        .filter(function (d) {
          return !d.children;
        }); // filter out the outer bubble

      // assign new data to existing DOM
      var vis = svg.selectAll('g')
        .data(nodes, function (d) {
          return d.name;
        });

      // enter data -> remove, so non-exist selections for upcoming data won't stay -> enter new data -> ...

      // To chain transitions,
      // create the transition on the updating elements before the entering elements
      // because enter.append merges entering elements into the update selection

      var duration = 300;
      var delay = 0;

      // update - this is created before enter.append. it only applies to updating nodes.
      vis.transition()
        .duration(duration)
        .delay(function (d, i) {
          delay = i * 7;
          return delay;
        })
        .attr('transform', function (d) {
          return 'translate(' + d.x + ',' + d.y + ')';
        })
        .attr('r', function (d) {
          return d.r;
        })
        .style('opacity', 1); // force to 1, so they don't get stuck below 1 at enter()

      // enter - only applies to incoming elements (once emptying data)
      var nodez = vis.enter().append('g').attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });
      nodez.on("click", function(d) { $scope.editAmount(d.userId);});
      var circle = nodez.append('circle')

        .attr('r', function (d) {
          return 40;
        })
        .attr('fill', function (d) {
          return d.color;
        });
      nodez.append("text")
        .attr("text-anchor", "middle")
        .attr('dy', -10)
        .text(function (d) {
          return d.name
        }).attr('fill', '#FFF')
      nodez.append("text")
        .attr("text-anchor", "middle")
        .attr('font-weight', 'bolder')
        .attr('dy', 10)
        .text(function (d) {
          return d.amount
        }).attr('fill', '#FFF')
        .style('opacity', 0)
        .transition()
        .duration(duration * 1.2)
        .style('opacity', 1);


      // exit
      vis.exit()
        .transition()
        .duration(duration + delay)
        .style('opacity', 0)
        .remove();
    }

    $scope.addElem = function () {
      $scope.elems.push({
        name: 'asd' + Math.random(),
        size: 22,
        color: "#" + ((1 << 24) * Math.random() | 0).toString(16),
        amount: '40TL'
      });
      console.log($scope.elems);
      drawBubbles($scope.elems);

    };

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
