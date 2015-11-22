angular.module('starter.controllers', [])

  .controller('AuthenticationController', function ($scope, $state, $cordovaToast, $ionicLoading, AuthenticationService) {
    $scope.user = {
      username: null,
      password: null
    };

    if (AuthenticationService.getAuthorization() != null) {
      $ionicLoading.show();
      AuthenticationService.populateUser().then(function (response) {
        $ionicLoading.hide();
        response = response.data;
        if (response.success) {
          AuthenticationService.setCurrentUser(response.data);
          $state.go('dash');
        } else {
          $cordovaToast.showLongBottom(response.message);
        }
      }, function (error) {
        $ionicLoading.hide();
      });
    }

    $scope.login = function () {
      $ionicLoading.show();
      AuthenticationService.signIn($scope.user).then(function (response) {
        $ionicLoading.hide();
        response = response.data;
        if (response.success) {
          AuthenticationService.setCurrentUser($scope.user);
          AuthenticationService.setAuthorization(response.data.token);
          $state.go('dash');
        } else {
          $cordovaToast.showLongBottom(response.message);
        }
      }, function (error) {
        $ionicLoading.hide();
        $cordovaToast.showLongBottom("ErrorMessage::Login");
      });
    };

    $scope.register = function () {
      $ionicLoading.show();
      AuthenticationService.register($scope.user).then(function (response) {
        $ionicLoading.hide();
        response = response.data;
        if (response.success) {
          $scope.login($scope.user);
        } else {
          $cordovaToast.showLongBottom(response.message);
        }
      }, function (error) {
        $ionicLoading.hide();
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

  .controller('TableController', function ($scope, $state, $stateParams, $ionicLoading, $cordovaToast, $ionicPopup, $interval, $ionicModal, DashboardService, AuthenticationService) {
    $scope.showTable = false;
    $scope.searchResult = null;
    $scope.totalAmount = 0;
    $scope.committed = 0;
    $scope.ownAmount = 0;

    $scope.table = {
      code: null
    };
    $scope.percentage = $scope.committed.toFixed(2) * 100 / $scope.totalAmount.toFixed(2);

    $scope.data = {};
    $scope.creditcard = {};
    $scope.elems = [];

    $scope.drawTable = function (elements) {
      var diameter = document.getElementById('search-bar').offsetWidth;
      d3.selectAll("#chart > *").remove();
      var svg = d3.select('#chart').append('svg')
        .attr('width', diameter)
        .attr('height', diameter);

      var bubble = d3.layout.pack().size([diameter, diameter])
        .value(function (d) {
          return d.size;
        }) // new data is loaded to bubble layout
        .padding(1);

      function drawBubbles(m) {

        // generate data with calculated layout values
        var nodes = bubble.nodes({children: elements})
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
        nodez.on("click", function (d) {
          if (d.editable) {
            $scope.editAmount(d.contributionId, d.userId);
          }
        });
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
            return d.name;
          }).attr('fill', '#FFF')
        nodez.append("text")
          .attr("text-anchor", "middle")
          .attr('font-weight', 'bolder')
          .attr('dy', 10)
          .text(function (d) {
            return d.amount;
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

        d3.layout.pack(nodes);
      };

      drawBubbles(elements);
    };

    $scope.prepareData = function () {
      var rawData = DashboardService.getData();
      var currentUser = AuthenticationService.getCurrentUser();
      $scope.totalAmount = rawData.billTotal;
      $scope.seller = rawData.seller.fullname;
      $scope.content = rawData.billItems;
      var participants = rawData.billContributers;
      $scope.elems = [];
      $scope.committed = 0;
      for (var i = 0; i < participants.length; i++) {
        var par = participants[i];
        if(par[1].customer.id == currentUser.id) {
          $scope.ownAmount = par[0].contribution.contrubution;
        }
        $scope.committed += par[0].contribution.contrubution;
        $scope.elems.push({
          name: par[1].customer.id == currentUser.id ? "BEN" : par[1].customer.username,
          amount: par[0].contribution.contrubution + '₺',
          size: 25,
          color: par[1].customer.id == currentUser.id ? "#009bb6" : "#fbad3b",
          editable: par[1].customer.id == currentUser.id ? true : false,
          contributionId: par[0].contribution.id
        });
      }
      $scope.percentage = $scope.committed.toFixed(2) * 100 / $scope.totalAmount.toFixed(2);
      $scope.drawTable($scope.elems);
    };
    $scope.prepareData();

    $interval(function () {
      DashboardService.getTable($stateParams.code).then(function (response) {
        response = response.data;
        if (response.success) {
          DashboardService.setData(response.data);
          $scope.prepareData();
        } else {
          $cordovaToast.showShortCenter(response.message);
        }
      }, function (error) {
        $cordovaToast.showShortCenter("ErrorMessage::GetTable");
      });
    }, 5000);

    $scope.setAmount = function (contributionId, amount) {
      $ionicLoading.show();
      DashboardService.setAmount(contributionId, amount).then(function (response) {
        $ionicLoading.hide();
        response = response.data;
        if (response.success) {
          //Service should return updated amount only !
        } else {
          $cordovaToast.showShortCenter(response.message);
        }
      }, function (error) {
        $ionicLoading.hide();
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

      $ionicLoading.show();
      DashboardService.addUserToTable(userId, $stateParams.code).then(function (response) {
        $ionicLoading.hide();
        response = response.data;
        if (response.success) {
          $scope.table = response.data;
        } else {
          $cordovaToast.showShortBottom(response.message);
        }
      }, function (error) {
        $ionicLoading.hide();
        $cordovaToast.showShortBottom("ErrorMessage::AddUser");
      });

    };

    $scope.editAmount = function (contributionId) {
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
                $scope.setAmount(contributionId, $scope.data.amount);
                return;
              }
            }
          }
        ]
      });
    };

    var paymentPopup;
    $scope.$watch('data.selectedCard', function () {
      if ($scope.data.selectedCard == -1) {
        $scope.openModal2();
        paymentPopup.close();
      }
    });

    $scope.makePayment = function () {
      $scope.data.selectedCard = null;
      $ionicLoading.show();
      DashboardService.getCreditCardList().then(function (response) {
        $ionicLoading.hide();
        response = response.data;
        if (response.success) {
          $scope.data.creditCardList = response.data;
          $scope.data.creditCardList.push({
            id: -1,
            number: 'Yeni kart tanımla'
          });
          paymentPopup = $ionicPopup.show({
            template: '<div class="row"><label class="item item-input item-select" style="max-width: 100%; width: 100%;"><select style="position: initial; font-size: 10px; padding: 0;" ng-model="data.selectedCard" ng-value="" ng-options="card.id as card.number for card in data.creditCardList"><option value="">Ödeme yöntemi seçiniz</option></select></label></div></div>' +
                      '<div class="row" style="font-size: 14px;color: #009bb6;"><div class="col col-50">Tutar</div><div class="col col-50" style="text-align: right;border-bottom: 1px solid #009bb6;">{{ownAmount}}₺</div></div>' +
                      '<div class="row" style="font-size: 12px;color: #009bb6;border-bottom: 1px solid #009bb6;"><div class="col col-50">İşlem Tutarı</div><div class="col col-50" style="text-align: right;">0.05₺</div></div>' +
                      '<div class="row" style="font-size: 16px;color: #009bb6;margin-top: 5px;"><div class="col col-50">Toplam Tutar</div><div class="col col-50" style="text-align: right; ">{{ownAmount + 0.05}}₺</div></div>',
            title: 'Ödeme Özeti',
            scope: $scope,
            buttons: [
              {text: 'İptal'},
              {
                text: '<b>Kaydet</b>',
                type: 'button-positive',
                onTap: function (e) {
                  if (!$scope.data.selectedCard > 0) {
                    //don't allow the user to close unless he enters wifi password
                    e.preventDefault();
                  } else {
                    $ionicLoading.show();
                    DashboardService.makePayment($stateParams.code, $scope.data.selectedCard).then(function (response) {
                      $ionicLoading.hide();
                      response = response.data;
                      if (response.success) {
                        $state.go('settlement', {code: $stateParams.code});
                      } else {
                        $cordovaToast.showLongBottom(response.message);
                      }
                    }, function (error) {
                      $ionicLoading.hide();
                      $cordovaToast.showLongBottom("ErrorMessage::MakePayment");
                    });
                    return;
                  }
                }
              }
            ]
          });
        } else {
          $cordovaToast.showLongBottom(response.message);
        }
      }, function (error) {
        $ionicLoading.hide();
        $cordovaToast.showLongBottom("ErrorMessage::GetCardList");
      });

    };

    $scope.saveCreditCard = function () {
      var number = $scope.creditcard.part1 + "" + $scope.creditcard.part2 + "" + $scope.creditcard.part3 + "" + $scope.creditcard.part4;
      var month = $scope.creditcard.month;
      var year = $scope.creditcard.year;
      var cvc2 = $scope.creditcard.cvc2;

      $ionicLoading.show();
      DashboardService.saveCreditCard(number, month, year, cvc2).then(function (response) {
        $ionicLoading.hide();
        response = response.data;
        if (response.success) {
          $scope.data.creditCardList = response.data;
        } else {
          $cordovaToast.showLongBottom(response.message);
        }
      }, function (error) {
        $ionicLoading.hide();
        $cordovaToast.showLongBottom("ErrorMessage::SaveCard");
      });
    };


    $ionicModal.fromTemplateUrl('templates/content-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal
    });

    $ionicModal.fromTemplateUrl('templates/creditcard-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal2) {
      $scope.modal2 = modal2
    });

    $scope.openModal = function () {
      $scope.modal.show()
    };

    $scope.closeModal = function () {
      $scope.modal.hide();
    };

    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });

    $scope.openModal2 = function () {
      $scope.modal2.show()
    };

    $scope.closeModal2 = function (val) {
      $scope.modal2.hide();
      if (val) {
        $scope.saveCreditCard();
      }
    };

    $scope.$on('$destroy', function () {
      $scope.modal2.remove();
    });
  })

  .controller('DashboardController', function ($scope, $state, $ionicLoading, $cordovaToast, $ionicPopup, DashboardService) {
    $scope.data = {};
    $scope.enterCode = function () {
      $ionicLoading.show();
      DashboardService.getTable($scope.data.code).then(function (response) {
        $ionicLoading.hide();
        response = response.data;
        if (response.success) {
          DashboardService.setData(response.data);
          $state.go('table', {code: $scope.data.code});
        } else {
          $cordovaToast.showShortCenter(response.message);
        }
      }, function (error) {
        $ionicLoading.hide();
        $cordovaToast.showShortCenter("ErrorMessage::GetTable");
      });
    };

  })

  .controller('SettlementController', function ($scope, $stateParams, $ionicLoading, $state, $interval, $cordovaToast, $ionicPopup, AuthenticationService, DashboardService) {
    var code = $stateParams.code;

    $scope.prepareData = function () {
      var rawData = DashboardService.getData();
      var currentUser = AuthenticationService.getCurrentUser();
      $scope.intervalPromise = null;
      $scope.totalAmount = rawData.billTotal;
      $scope.seller = rawData.seller.fullname;
      $scope.content = rawData.billItems;
      var participants = rawData.billContributers;
      $scope.elems = [];
      $scope.committed = 0;
      for (var i = 0; i < participants.length; i++) {
        var par = participants[i];
        $scope.committed += par[0].contribution.contrubution;
        $scope.elems.push({
          name: par[1].customer.id == currentUser.id ? "BEN" : par[1].customer.username,
          amount: par[0].contribution.contrubution + '₺',
          status: par[0].contribution.status,
          color: par[0].contribution.status == 'UNPAID' ? 'red' : par[0].contribution.status == 'CONFIRMED' ? 'yellow' : 'green',
          contributionId: par[0].contribution.id
        });
      }

      var flag = true;
      for (var i = 0; i < $scope.elems.length; i++) {
        if ($scope.elems[i].status != 'PAID') {
          flag = false;
        }
      }

      if (flag) {
        var alertPopup = $ionicPopup.alert({
          title: 'Afiyet Olsun!',
          template: 'Ödeme işlemleri tamamlanmıştır.'
        });
        alertPopup.then(function (res) {
          $interval.cancel($scope.intervalPromise);
          $state.go('dash');
        });
      }
      $scope.percentage = $scope.committed.toFixed(2) * 100 / $scope.totalAmount.toFixed(2);
    };

    $scope.intervalPromise = $interval(function () {
      DashboardService.getTable(code).then(function (response) {
        response = response.data;
        if (response.success) {
          DashboardService.setData(response.data);
          $scope.prepareData();
        } else {
          $cordovaToast.showShortCenter(response.message);
        }
      }, function (error) {
        $cordovaToast.showShortCenter("ErrorMessage::GetTable");
      });
    }, 5000);


  })

  .controller('AccountCtrl', function ($scope) {
    $scope.settings = {
      enableFriends: true
    };
  });
