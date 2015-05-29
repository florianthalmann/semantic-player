var $http = angular.injector(['ng']).get('$http');

angular.module('semanticplayer', ['ionic'])

.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
		if(window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if(window.StatusBar) {
			StatusBar.styleDefault();
		}
	});
})

.controller('renderingController', function($scope, $interval) {
	$scope.rendering;
	$scope.accelerometerWatcher;
	$scope.geolocationWatcher;
	$scope.compassWatcher;
	$scope.sliderControls = [];
	$scope.statsControls;
	$scope.showSensorData = false;
	//container for model primitives (angular needs an object to contain them!?)
	$scope.vars = {};
	$scope.dmos = ["spatial", "mixing"];
	
	$scope.dmoSelected = function() {
		if ($scope.vars.selectedDmo) {
			var dmoUri = "audio/"+$scope.vars.selectedDmo;
			var loader = new OntologyLoader(dmoUri, $scope, $interval)
			loader.loadDmo("/config.n3");
		}
	}
	
	//INIT SELECTION
	$scope.vars.selectedDmo = $scope.dmos[0];
	$scope.dmoSelected();
	
	$scope.toggleSensorData = function() {
		$scope.showSensorData = !$scope.showSensorData;
	}
	
});
