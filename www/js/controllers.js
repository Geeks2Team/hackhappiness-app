angular.module('app.controllers', ['uiGmapgoogle-maps'])

.controller('MapCtrl', function($scope, GeoService, MarkersService, uiGmapIsReady) {

  uiGmapIsReady.promise(1).then(function(instances) {
    instances.forEach(function(inst) {
      
      ionic.Platform.ready(function() { 
        GeoService.getCurrentPosition(function (position) {
          $scope.map.control.refresh({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          );
        });
      });

    });
  });

  var updateMarkers = function(e) {

    if (typeof $scope.markers.control.updateModels == 'function') {
      $scope.markers.control.updateModels(
        MarkersService.getFakeMarkers(e.data.map.center.lat(), e.data.map.center.lng())
      );
    }
  };
  
  $scope.markers = {
    models: [],
    control: {}
  };
  $scope.map = GeoService.map;
  $scope.map.events = {
    // Al realizar un drag del mapa, se actualizan los markers.
    'bounds_changed' : updateMarkers
  };
})

.controller('TrendingCtrl', function($scope, $ionicModal, $state, Users, Happinesses, happinessRange) {
  $scope.happinesses = [];
  $scope.happinessRange = happinessRange;
  $scope.happinessRangeMin = $scope.happinessRange[0];
  $scope.happinessRangeMax = $scope.happinessRange[$scope.happinessRange.length - 1];

  Happinesses.get({
    $sort: {
      createdDate: -1
    }
  }).then(function(response){
    $scope.happinesses = response.data;
  });

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/addHappinessModal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the modal to close it
  $scope.closeAddHappiness = function() {
    $scope.modal.hide();
  };

  // Open the modal
  $scope.openAddHappiness = function() {
    Users.current()
      .then($scope.modal.show)
      .catch(function(){
        $state.go('app.account');
      });
  };
})

.controller('AboutCtrl', function($scope) {})

.controller('AccountCtrl', function($scope, $ionicModal, $cookies, Users, Happinesses, happinessRange) {
  var currentForm;
  var getCurrentUser = function(){
    return Users.current()
      .then(function(user){
        $scope.user = user;
        getUserHappinesses();
      })
      .catch(function(data){
        $scope.login();
      });
  };
  var getUserHappinesses = function(){
    Happinesses.get({
      user: $scope.user.id,
      $sort: {
        createdDate: -1
      }
    }).then(function(response){
      $scope.happinesses = response.data;
    });
  };
  var loginSuccess = function(user){
    $scope.user = user;
    $scope.auth.data = {};
    currentForm.$setPristine();
    getUserHappinesses();
    $scope.closeAuth();
    currentForm = null;
  };
  var logoutSuccess = function(){
    $cookies.sid = null;
    $scope.user = null;
  };
  $scope.$on('$ionicView.beforeEnter', getCurrentUser);
  $scope.happinessRange = happinessRange;
  $scope.auth = {
    action: 'login'
  };
  $scope.auth.setAuthAction = function(action) {
    $scope.auth.action = action;
  };
  $ionicModal.fromTemplateUrl("templates/modal-auth.html", {
    scope: $scope
  }).then(function(modal) {
    $scope.auth.modal = modal;
  });
  $scope.login = function() {
    $scope.auth.setAuthAction('login');
    $scope.auth.modal.show();
  };
  $scope.register = function() {
    $scope.auth.setAuthAction('register');
    $scope.auth.modal.show();
  };
  $scope.closeAuth = function(){
    $scope.auth.modal.hide();
  };

  $scope.doRegister = function(form){
    currentForm = form;
    if(form.$valid)
    {
      Users.register($scope.auth.data)
        .then(loginSuccess)
        .catch(console.error);
    }
  };
  $scope.doLogin = function(form){
    currentForm = form;
    if(form.$valid)
    {
      Users.login($scope.auth.data)
        .then(loginSuccess)
        .catch(console.error);
    }
  };
  $scope.doLogout = function(){
    Users.logout()
      .then(logoutSuccess)
      .catch(console.error);
  };

})
.controller('LoginCtrl', function($scope, $ionicHistory) {
  // var backView = $ionicHistory.backView();
  // $ionicHistory.currentView(backView);
  // $ionicHistory.backTitle(backView.title);
})
.controller('RegisterCtrl', function($scope, $ionicHistory) {
  // var backView = $ionicHistory.backView();
  // $ionicHistory.currentView(backView);
  // $ionicHistory.backTitle(backView.title);
});