var $http = angular.injector(['ng']).get('$http');

angular.module('semanticplayer', ['ionic', 'ngCordova'])

.run(function($ionicPlatform, $rootScope, $cordovaFile) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
		if(window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if(window.StatusBar) {
			StatusBar.styleDefault();
		}
		
		/* DIDNT WORK IN BROWSER....
		ionic.Platform.ready(function(){
			console.log("READY");
			/*$cordovaFile.checkDir('/audio/example/')
			.then(function (success) {
					console.log(success);
				}, function (error) { 
					console.log(error);
				});
				
			$cordovaFile.readAsText($cordovaFile.file.applicationDirectory, "audio/example/example.n3")
				.then(function (success) {
					console.log("HEEEYY"+success);
			}, function (error) {
					console.log(error);
			});
		});*/
		
		var mobileRdfUri = "rdf/mobile.n3";
		var multitrackRdfUri = "http://purl.org/ontology/studio/multitrack";
		var rdfsUri = "http://www.w3.org/2000/01/rdf-schema";
		
		$rootScope.rendering;
		var accelerometerWatcher;
		$rootScope.sliderControllers = [];
		
		var dmoFolder = "audio/";
		$rootScope.dmos = ["example"];
		//container for model primitives (angular needs an object to contain them!?)
		$rootScope.vars = {};
		$rootScope.vars.selectedDmo = $rootScope.dmos[0];
		loadSelectedDmo();
		var dmoUri;
		
		$rootScope.dmoSelected = loadSelectedDmo;
		
		function loadSelectedDmo() {
			if ($rootScope.vars.selectedDmo) {
				dmoUri = dmoFolder+$rootScope.vars.selectedDmo;
				var dmoRdfUri = dmoUri+"/example.n3";
				$http.get(dmoRdfUri).success(function(data) {
					rdfstore.create(function(err, store) {
						store.load('text/turtle', data, function(err, results) {
							if (err) {
								console.log(err);
							}
							store.execute("SELECT ?rendering ?label \
							WHERE { ?rendering a <"+mobileRdfUri+"#Rendering> . \
							?rendering <"+rdfsUri+"#label> ?label }", function(err, results) {
								for (var i = 0; i < results.length; i++) {
									//TODO MAKE LIST WITH SEVERAL SELECTABLE RENDERINGS!!
									loadRendering(store, results[i].rendering.value, results[i].label.value);
								}
							});
						});
					});
				});
			}
		}
		
		var loadRendering = function(store, renderingUri, label) {
			store.execute("SELECT ?label ?path \
			WHERE { <"+renderingUri+"> <"+multitrackRdfUri+"#track> ?track . \
			?track <"+mobileRdfUri+"#hasPath> ?path }", function(err, results) {
				var trackPaths = [];
				for (var i = 0; i < results.length; i++) {
					trackPaths.push(dmoUri+"/"+results[i].path.value);
				}
				$rootScope.rendering = new Rendering(label, trackPaths, $rootScope);
				loadMappings(store, renderingUri);
			});
		}
		
		var loadMappings = function(store, renderingUri) {
			store.execute("SELECT ?mapping WHERE { <"+renderingUri+"> <"+mobileRdfUri+"#hasMapping> ?mapping }", function(err, results) {
				for (var i = 0; i < results.length; i++) {
					loadMapping(store, results[i].mapping.value);
				}
			});
		}
		
		var loadMapping = function(store, mappingUri) {
			store.execute("SELECT ?control ?trackPath ?parameter ?multiplier \
			WHERE { <"+mappingUri+"> <"+mobileRdfUri+"#fromControl> ?control . \
			<"+mappingUri+"> <"+mobileRdfUri+"#toTrack> ?track . \
			?track <"+mobileRdfUri+"#hasPath> ?trackPath . \
			<"+mappingUri+"> <"+mobileRdfUri+"#toParameter> ?parameter . \
			<"+mappingUri+"> <"+mobileRdfUri+"#hasMultiplier> ?multiplier}", function(err, results) {
				var accelerometerWatcher;
				for (var i = 0; i < results.length; i++) {
					var control = getControl(results[i].control.value);
					var track = $rootScope.rendering.getTrackForPath(dmoUri+"/"+results[i].trackPath.value);
					var parameter = getParameter(track, results[i].parameter.value);
					var multiplier = results[i].multiplier.value;
					new Mapping(control, parameter, multiplier);
				}
			});
		}
		
		var getControl = function(controlUri) {
			if (controlUri == mobileRdfUri+"#AccelerometerX") {
				return getAccelerometerControl(0);
			} else if (controlUri == mobileRdfUri+"#AccelerometerY") {
				return getAccelerometerControl(1);
			}	else if (controlUri == mobileRdfUri+"#AccelerometerZ") {
				return getAccelerometerControl(2);
			} else if (controlUri == mobileRdfUri+"#SliderControl") {
				var sliderController = new Controller($rootScope);
				$rootScope.sliderControllers.push(sliderController);
				$rootScope.$apply();
				return sliderController;
			}
		}
		
		var getAccelerometerControl = function(index) {
			if (!accelerometerWatcher) {
				accelerometerWatcher = new AccelerometerWatcher();
			}
			if (index == 0) {
				return accelerometerWatcher.xController;
			} else if (index == 1) {
				return accelerometerWatcher.yController;
			} else {
				return accelerometerWatcher.zController;
			}
		}
		
		var getParameter = function(track, parameterUri) {
			if (parameterUri == mobileRdfUri+"#Amplitude") {
				return track.amplitude;
			} else if (parameterUri == mobileRdfUri+"#Pan") {
				return track.pan;
			}	else if (parameterUri == mobileRdfUri+"#Distance") {
				return track.distance;
			}
		}
		
	});
})
