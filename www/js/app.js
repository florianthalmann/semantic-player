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

.controller('renderingController', function($scope) {
	
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	$scope.audioContext = new AudioContext();
	
	$scope.showSensorData = false;
	//container for model primitives (angular needs an object to contain them!?)
	$scope.vars = {};
	
	$scope.resetUI = function() {
		$scope.mappingLoadingThreads = 0;
		$scope.featureLoadingThreads = 0;
		if ($scope.rendering) {
			$scope.rendering.stop();
		}
		$scope.rendering = null;
		$scope.accelerometerWatcher = null;
		$scope.geolocationWatcher = null;
		$scope.compassWatcher = null;
		$scope.uiControls = {};
		$scope.mappings = {};
	}
	
	$scope.dymoSelected = function() {
		if ($scope.vars.selectedDymo) {
			$scope.resetUI();
			var dymoUri = "dymos/"+$scope.vars.selectedDymo;
			$scope.scheduler = new Scheduler($scope.audioContext, function() {
				$scope.sourcesReady = true;
				$scope.$apply();
			});
			$scope.scheduler.setReverbFile("lib/dymo-core/audio/impulse_rev.wav");
			var loader = new DymoLoader($scope.scheduler, $scope);
			loader.loadDymoFromJson(dymoUri+'/', 'dymo.json', function(loadedDymo) {
				loader.loadRenderingFromJson(dymoUri + '/rendering.json', loadedDymo[1], function(loadedRendering) {
					$scope.rendering = loadedRendering[0];
					$scope.rendering.dymo = loadedDymo[0];
					for (var key in loadedRendering[1]) {
						var currentControl = loadedRendering[1][key];
						if (UI_CONTROLS.indexOf(currentControl.getType()) >= 0) {
							$scope.uiControls[key] = new UIControl(currentControl, $scope);
						}
					}
					$scope.$apply();
				}, $http);
			}, $http);
		}
	}
	
	$scope.loadingString = function() {
		var loadedObjectString;
		if (!$scope.sourcesReady) {
			loadedObjectString = "audio";
		} else if ($scope.mappingLoadingThreads && $scope.mappingLoadingThreads > 0) {
			loadedObjectString = "ontologies (mappings)";
		} else if ($scope.featureLoadingThreads && $scope.featureLoadingThreads > 0) {
			loadedObjectString = "ontologies (features)";
		}
		if (loadedObjectString) {
			return "Loading " + loadedObjectString + "..."
		}
		return null;
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
