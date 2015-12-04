var MappingTypes = {
	PRODUCT_MAPPING: 0,
	SUM_MAPPING: 1
};

var DmoTypes = {
	SEQUENCE: 0,
	SIMULTANEITY: 1
}

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
	
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	$scope.audioContext = new AudioContext();
	
	$scope.showSensorData = false;
	//container for model primitives (angular needs an object to contain them!?)
	$scope.vars = {};
	$scope.dmos = ["beatmatch","decomposition", "decomposition1", "location", "spatial2", "features", "alfonso", "mixing", "beatgraph", "spatial"];
	
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
		$scope.statsControls = {};
		$scope.graphControls = {};
		$scope.uiControls = {};
		$scope.mappings = {};
	}
	
	$scope.dmoSelected = function() {
		if ($scope.vars.selectedDmo) {
			$scope.resetUI();
			var dmoUri = "audio/"+$scope.vars.selectedDmo;
			//var creator = new DmoCreator(dmoUri, $scope, $interval);
			//creator.writeDmo("/test.n3");
			$scope.scheduler = new Scheduler($scope.audioContext, function() {
				$scope.sourcesReady = true;
				$scope.$apply();
			});
			$scope.scheduler.setReverbFile("audio/impulse_rev.wav");
			var loader = new DymoLoader($scope.scheduler, $scope, $interval);
			loader.loadDymoFromJson(dmoUri + '/dymo.json', function(loadedDymo) {
				loader.loadRenderingFromJson(dmoUri + '/rendering.json', loadedDymo[1], function(loadedRendering) {
					$scope.rendering = loadedRendering[0];
					$scope.rendering.dmo = loadedDymo[0];
					$scope.uiControls = Object.keys(loadedRendering[1]).map(function (key) { return new UIControl(loadedRendering[1][key], $scope); });
					$scope.$apply();
				}, $http);
			}, $http);
			//loader.loadDmo(dmoUri, "/config.n3");
			
			//new OntologyLoader2(dmoUri, $scope, $interval, $rdf);
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
	
	//INIT SELECTION
	$scope.vars.selectedDmo = $scope.dmos[0];
	$scope.dmoSelected();
	
	$scope.toggleSensorData = function() {
		$scope.showSensorData = !$scope.showSensorData;
	}
	
});
