var $http = angular.injector(['ng']).get('$http');

angular.module('semanticplayer', ['ionic'])

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

.controller('renderingController', function($scope, $ionicLoading, $ionicPlatform) {
	
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	$scope.audioContext = new AudioContext();
	
	$scope.showSensorData = false;
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
		if ($scope.selectedDymo) {
			$scope.resetUI();
			loadingAudio = true;
			$scope.updateLoading();
			
			$scope.manager = new DymoManager($scope.audioContext, undefined, 'lib/dymo-core/audio/impulse_rev.wav', $scope);
			$scope.manager.loadDymoAndRendering($scope.selectedDymo.dymoUri, $scope.selectedDymo.renderingUri, function() {
				loadingAudio = false;
				$scope.updateLoading();
				$scope.uiControls = $scope.manager.getUIControls();
				$scope.sensorControls = $scope.manager.getSensorControls();
				for (control in $scope.sensorControls) {
					$scope.sensorControls[control].setScopeAndStart($scope);
				}
				loadingDymoAndRendering = false;
				$scope.updateLoading();
				$scope.$apply();
			});
		}
	}
	
	$scope.updateLoading = function() {
		if (loadingAudio) {
			$ionicLoading.show({
				template: 'Loading audio...'
			});
		} else if (loadingDymoAndRendering) {
			$ionicLoading.show({
				template: 'Loading mappings...'
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
		$scope.selectedDymo = $scope.config.dymos[0];
		$scope.dymoSelected();
	});
	
});
