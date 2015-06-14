function OntologyLoader(dmoUri, $scope, $interval) {
	
	var mobileRdfUri = "rdf/mobile.n3";
	var multitrackRdfUri = "http://purl.org/ontology/studio/multitrack";
	var rdfsUri = "http://www.w3.org/2000/01/rdf-schema";
	
	this.loadDmo = function(rdfUri) {
		$http.get(dmoUri+rdfUri).success(function(data) {
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
	
	function loadRendering(store, renderingUri, label) {
		store.execute("SELECT ?track ?path \
		WHERE { <"+renderingUri+"> <"+multitrackRdfUri+"#track> ?track . \
		?track <"+mobileRdfUri+"#hasAudioPath> ?path }", function(err, results) {
			var trackUris = [];
			var trackPaths = [];
			for (var i = 0; i < results.length; i++) {
				trackUris.push(results[i].track.value);
				trackPaths.push(dmoUri+"/"+results[i].path.value);
			}
			$scope.rendering = new Rendering(label, trackPaths, $scope);
			loadFeatures(store, trackUris);
			loadMappings(store, renderingUri);
		});
	}
	
	function loadFeatures(store, trackUris) {
		for (var i = 0; i < trackUris.length; i++) {
			store.execute("SELECT ?path \
			WHERE { <"+trackUris[i]+"> <"+mobileRdfUri+"#hasFeaturesPath> ?path }", function(err, results) {
				for (var i = 0; i < results.length; i++) {
					loadEventTimes(i, "/"+results[i].path.value);
				}
				if (results.length <= 0) {
					$scope.ontologiesLoaded = true;
				}
			});
		}
	}
	
	function loadMappings(store, renderingUri) {
		store.execute("SELECT ?mapping WHERE { <"+renderingUri+"> <"+mobileRdfUri+"#hasMapping> ?mapping }", function(err, results) {
			for (var i = 0; i < results.length; i++) {
				loadMapping(store, results[i].mapping.value);
			}
		});
	}
	
	function loadMapping(store, mappingUri) {
		$scope.mappingLoadingThreads++;
		store.execute("SELECT ?mappingType ?control ?controlType ?trackPath ?parameter ?multiplier ?addend ?modulus ?minimum ?maximum ?label \
		WHERE { <"+mappingUri+"> a ?mappingType . \
			<"+mappingUri+"> <"+mobileRdfUri+"#toTrack> ?track . \
			?track <"+mobileRdfUri+"#hasAudioPath> ?trackPath . \
			<"+mappingUri+"> <"+mobileRdfUri+"#toParameter> ?parameter . \
		OPTIONAL { <"+mappingUri+"> <"+mobileRdfUri+"#fromControl> ?control . \
			OPTIONAL { ?control a ?controlType . } \
			OPTIONAL { ?control <"+rdfsUri+"#label> ?label . } } \
		OPTIONAL { <"+mappingUri+"> <"+mobileRdfUri+"#hasMultiplier> ?multiplier . } \
		OPTIONAL { <"+mappingUri+"> <"+mobileRdfUri+"#hasAddend> ?addend . } \
		OPTIONAL { <"+mappingUri+"> <"+mobileRdfUri+"#hasModulus> ?modulus . } \
		OPTIONAL { <"+mappingUri+"> <"+mobileRdfUri+"#hasMinimum> ?minimum . } \
		OPTIONAL { <"+mappingUri+"> <"+mobileRdfUri+"#hasMaximum> ?maximum . } }", function(err, results) {
			for (var i = 0; i < results.length; i++) {
				var control = getControlFromResults(results[i].control, results[i].controlType, results[i].label);
				var track = $scope.rendering.getTrackForPath(dmoUri+"/"+results[i].trackPath.value);
				var parameter = getParameter(track, results[i].parameter.value);
				var multiplier = getNumberValue(results[i].multiplier, 1);
				var addend = getNumberValue(results[i].addend, 0);
				var modulus = getNumberValue(results[i].modulus);
				var minimum = getNumberValue(results[i].minimum);
				var maximum = getNumberValue(results[i].maximum);
				if (results[i].mappingType.value == mobileRdfUri+"#LocationMapping") {
					loadLocations(store, mappingUri, parameter, minimum, maximum);
				} else {
					if (control) { //control might not be available, e.g. accelerometer on laptops
						$scope.mappings[mappingUri] = new Mapping(control, parameter, multiplier, addend, modulus);
					}
					$scope.mappingLoadingThreads--;
					$scope.$apply();
				}
				//console.log(control + " " + track + " " + parameter + " " + label);
			}
		});
	}
	
	function loadLocations(store, locationMappingUri, parameter, minimum, maximum) {
		store.execute("SELECT ?control ?controlType ?label ?value ?range \
		WHERE { <"+locationMappingUri+"> <"+mobileRdfUri+"#hasLocation> ?location . \
			?location <"+mobileRdfUri+"#fromControl> ?control . \
			?location <"+mobileRdfUri+"#atValue> ?value . \
			?location <"+mobileRdfUri+"#hasRange> ?range . \
		OPTIONAL { ?control a ?controlType . } \
		OPTIONAL { ?control <"+rdfsUri+"#label> ?label . }}", function(err, results) {
			var controls = [];
			var values = [];
			var ranges = [];
			for (var i = 0; i < results.length; i++) {
				controls[i] = getControlFromResults(results[i].control, results[i].controlType, results[i].label);
				values[i] = getNumberValue(results[i].value);
				ranges[i] = getNumberValue(results[i].range);
			}
			$scope.mappings[locationMappingUri] = new LocationMapping(controls, values, ranges, parameter, minimum, maximum);
			$scope.mappingLoadingThreads--;
			$scope.$apply();
		});
	}
	
	function getControlFromResults(controlResult, controlTypeResult, labelResult) {
		if (labelResult) {
			var label = labelResult.value;
		}
		if (controlResult) {
			var control = controlResult.value;
		}
		if (controlTypeResult) {
			var controlType = controlTypeResult.value;
		}
		//console.log(control, controlType, label);
		return getControl(control, controlType, label);
	}
	
	function getNumberValue(result, defaultValue) {
		if (result) {
			return Number(result.value);
		}
		return defaultValue;
	}
	
	function getControl(controlUri, controlTypeUri, label) {
		if (controlUri == mobileRdfUri+"#AccelerometerX") {
			return getAccelerometerControl(0);
		} else if (controlUri == mobileRdfUri+"#AccelerometerY") {
			return getAccelerometerControl(1);
		}	else if (controlUri == mobileRdfUri+"#AccelerometerZ") {
			return getAccelerometerControl(2);
		} else if (controlUri == mobileRdfUri+"#GeolocationLatitude") {
			return getGeolocationControl(0);
		}	else if (controlUri == mobileRdfUri+"#GeolocationLongitude") {
			return getGeolocationControl(1);
		}	else if (controlUri == mobileRdfUri+"#GeolocationDistance") {
			return getGeolocationControl(2);
		}	else if (controlUri == mobileRdfUri+"#CompassHeading") {
			return getCompassControl(0);
		}	else if (controlTypeUri == mobileRdfUri+"#Slider") {
			if ($scope.sliderControls[controlUri]) {
				return $scope.sliderControls[controlUri];
			}
			$scope.sliderControls[controlUri] = new Control(0, label, $scope);
			$scope.$apply();
			return $scope.sliderControls[controlUri];
		} else if (controlUri == mobileRdfUri+"#Random") {
			return getStatsControl(0);
		}
	}
	
	function getAccelerometerControl(index) {
		if (!$scope.accelerometerWatcher) {
			$scope.accelerometerWatcher = new AccelerometerWatcher($scope);
		}
		if (index == 0) {
			return $scope.accelerometerWatcher.xControl;
		} else if (index == 1) {
			return $scope.accelerometerWatcher.yControl;
		} else {
			return $scope.accelerometerWatcher.zControl;
		}
	}
	
	function getGeolocationControl(index) {
		if (!$scope.geolocationWatcher) {
			$scope.geolocationWatcher = new GeolocationWatcher($scope);
		}
		if (index == 0) {
			return $scope.geolocationWatcher.latitudeControl;
		} else if (index == 1) {
			return $scope.geolocationWatcher.longitudeControl;
		} else {
			return $scope.geolocationWatcher.distanceControl;
		}
	}
	
	function getCompassControl(index) {
		if (!$scope.compassWatcher) {
			$scope.compassWatcher = new CompassWatcher($scope);
		}
		if (index == 0) {
			return $scope.compassWatcher.headingControl;
		} else {
			return $scope.compassWatcher.accuracyControl;
		}
	}
	
	function getStatsControl(index) {
		if (!$scope.statsControls) {
			$scope.statsControls = new StatsControls($interval);
		}
		if (index == 0) {
			return $scope.statsControls.randomControl;
		}
	}
	
	function getParameter(track, parameterUri) {
		if (parameterUri == mobileRdfUri+"#Amplitude") {
			return track.amplitude;
		} else if (parameterUri == mobileRdfUri+"#Pan") {
			return track.pan;
		}	else if (parameterUri == mobileRdfUri+"#Distance") {
			return track.distance;
		} else if (parameterUri == mobileRdfUri+"#Reverb") {
			return track.reverb;
		} else if (parameterUri == mobileRdfUri+"#Onset") {
			return track.onset;
		} else if (parameterUri == mobileRdfUri+"#ListenerOrientation") {
			return $scope.rendering.listenerOrientation;
		} else if (parameterUri == mobileRdfUri+"#StatsFrequency") {
			if (!$scope.statsControls) {
				$scope.statsControls = new StatsControls($interval);
			}
			return $scope.statsControls.frequency;
		}
	}
	
	var eventOntology = "http://purl.org/NET/c4dm/event.owl";
	var timelineOntology = "http://purl.org/NET/c4dm/timeline.owl";
	
	function loadEventTimes(trackIndex, rdfUri) {
		//console.log("start");
		$scope.featureLoadingThreads++;
		$http.get(dmoUri+rdfUri).success(function(data) {
			//console.log("get");
			rdfstore.create(function(err, store) {
				//console.log("create");
				store.load('text/turtle', data, function(err, results) {
					//console.log("load");
					if (err) {
						console.log(err);
					}
					store.execute("SELECT ?xsdTime \
					WHERE { ?eventType <"+rdfsUri+"#subClassOf>* <"+eventOntology+"#Event> . \
					?event a ?eventType . \
					?event <"+eventOntology+"#time> ?time . \
					?time <"+timelineOntology+"#at> ?xsdTime }", function(err, results) {
						//console.log("execute");
						var times = [];
						for (var i = 0; i < results.length; i++) {
							times.push(toSecondsNumber(results[i].xsdTime.value));
						}
						$scope.rendering.tracks[trackIndex].setOnsets(times.sort(function(a,b){return a - b}));
						$scope.featureLoadingThreads--;
						$scope.$apply();
					});
				});
			});
		});
	}
	
	function toSecondsNumber(xsdDurationString) {
		return Number(xsdDurationString.substring(2, xsdDurationString.length-1));
	}
	
}