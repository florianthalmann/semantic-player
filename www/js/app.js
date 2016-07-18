var $http = angular.injector(['ng']).get('$http');

angular.module('semanticplayer', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
		if(window.cordova && window.cordova.plugins.Keyboard) {
			//cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if(window.StatusBar) {
			StatusBar.styleDefault();
		}
	});
})

.controller('renderingController', function($scope, $ionicLoading, $cordovaDeviceMotion, $cordovaDeviceOrientation, $cordovaGeolocation, $cordovaBeacon) {
	
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	$scope.audioContext = new AudioContext();
	
	var ngSensors = {};
	ngSensors["$cordovaDeviceMotion"] = $cordovaDeviceMotion;
	ngSensors["$cordovaDeviceOrientation"] = $cordovaDeviceOrientation;
	ngSensors["$cordovaGeolocation"] = $cordovaGeolocation;
	ngSensors["$cordovaBeacon"] = $cordovaBeacon;
	
	$scope.state = {};
	$scope.state.showSensorData = false;
	var loadingAudio = false;
	var loadingDymoAndRendering = false;
	
	$scope.resetUI = function() {
		if ($scope.rendering) {
			$scope.rendering.stop();
		}
		$scope.sensorControls = {};
		$scope.uiControls = {};
		$scope.manager;
	}
	
	$scope.dymoSelected = function() {
		if ($scope.state.selectedDymo) {
			$scope.resetUI();
			loadingDymoAndRendering = true;
			loadingAudio = true;
			$scope.updateLoading();
			
			$scope.manager = new DymoManager($scope.audioContext, undefined, 'lib/dymo-core/audio/impulse_rev.wav', $scope);
			$scope.manager.loadDymoAndRendering($scope.state.selectedDymo.dymoUri, $scope.state.selectedDymo.renderingUri, function() {
				$scope.uiControls = $scope.manager.getUIControls();
				$scope.sensorControls = $scope.manager.getSensorControls();
				for (control in $scope.sensorControls) {
					control = $scope.sensorControls[control];
					control.setScopeNgSensorAndStart($scope, ngSensors[control.getSensorName()]);
				}
				loadingDymoAndRendering = false;
				$scope.updateLoading();
				$scope.$apply();
			}, function() {
				if ($scope.config.autoplay) {
					loadingAudio = false;
					$scope.updateLoading();
					$scope.manager.startPlaying();
				}
			});
		}
	}
	
	$scope.updateLoading = function() {
		if (loadingDymoAndRendering) {
			$ionicLoading.show({
				template: 'Loading dymo...'
			});
		} else if (loadingAudio) {
			$ionicLoading.show({
				template: 'Loading audio...'
			});
		} else {
			$ionicLoading.hide();
		}
	}
	
	$scope.toggleSensorData = function() {
		$scope.showSensorData = !$scope.showSensorData;
	}
	
	$http.get('config.json').success(function(data) {
		$scope.config = data;
		$scope.state.selectedDymo = $scope.config.dymos[0];
		$scope.dymoSelected();
	});
	
});
