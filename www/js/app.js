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
		$scope.mappings = {};
		loadingString = null;
	}
	
	$scope.dymoSelected = function() {
		if ($scope.vars.selectedDymo) {
			$scope.resetUI();
			loadingAudio = true;
			$scope.updateLoading();
			var dymoUri = "dymos/"+$scope.vars.selectedDymo;
			$scope.scheduler = new Scheduler($scope.audioContext, function() {
				$scope.sourcesReady = true;
				loadingAudio = false;
				$scope.updateLoading();
				$scope.$apply();
			});
			$scope.scheduler.setReverbFile("lib/dymo-core/audio/impulse_rev.wav");
			loadingDymoAndRendering = true;
			$scope.updateLoading();
			var loader = new DymoLoader($scope.scheduler, $scope, $http);
			loader.loadDymoFromJson(dymoUri+'/', 'dymo.json', function(loadedDymo) {
				loader.loadRenderingFromJson('rendering.json', loadedDymo[1], function(loadedRendering) {
					$scope.rendering = loadedRendering[0];
					$scope.rendering.dymo = loadedDymo[0];
					for (var key in loadedRendering[1]) {
						var currentControl = loadedRendering[1][key];
						if (UI_CONTROLS.indexOf(currentControl.getType()) >= 0) {
							$scope.uiControls[key] = new UIControl(currentControl, $scope);
						}
					}
					loadingDymoAndRendering = false;
					$scope.updateLoading();
					$scope.$apply();
				}, $http);
			}, $http);
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
