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

.controller('renderingController', function($scope, $ionicLoading) {
	
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	$scope.audioContext = new AudioContext();
	
	$scope.showSensorData = false;
	//container for model primitives (angular needs an object to contain them!?)
	$scope.vars = {};
	
	var loadingAudio = false;
	var loadingDymoAndRendering = false;
	
	$scope.resetUI = function() {
		if ($scope.rendering) {
			$scope.rendering.stop();
		}
		$scope.rendering = null;
		$scope.accelerometerWatcher = null;
		$scope.geolocationWatcher = null;
		$scope.compassWatcher = null;
		$scope.uiControls = {};
		$scope.manager;
		loadingString = null;
	}
	
	$scope.dymoSelected = function() {
		if ($scope.vars.selectedDymo) {
			$scope.resetUI();
			loadingAudio = true;
			$scope.updateLoading();
			var dymoUri = "dymos/"+$scope.vars.selectedDymo;
			
			$scope.manager = new DymoManager($scope.audioContext, undefined, 'lib/dymo-core/audio/impulse_rev.wav', $scope);
			$scope.manager.loadDymoAndRendering(dymoUri+'/'+'dymo.json', 'rendering.json', function() {
				loadingAudio = false;
				$scope.updateLoading();
				$scope.uiControls = $scope.manager.getUIControls();
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
	
	//INIT SELECTION based on saved dymo list
	$http.get('dymos/dymos.json').success(function(data) {
		$scope.dymos = data.uris;
		$scope.vars.selectedDymo = $scope.dymos[0];
		$scope.dymoSelected();
	});
	
});
