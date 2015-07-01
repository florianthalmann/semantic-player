function OntologyLoader(dmoPath, $scope, $interval) {
	
	var mobileRdfUri = "rdf/mobile.n3";
	var multitrackRdfUri = "http://purl.org/ontology/studio/multitrack";
	var rdfsUri = "http://www.w3.org/2000/01/rdf-schema";
	
	var dmos = {}; //dmos at all hierarchy levels for quick access during mapping assignment
	
	this.loadDmo = function(rdfUri) {
		$http.get(dmoPath+rdfUri).success(function(data) {
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
		store.execute("SELECT ?dmo \
		WHERE { <"+renderingUri+"> <"+mobileRdfUri+"#hasDMO> ?dmo }", function(err, results) {
			$scope.rendering = new Rendering(label, $scope);
			$scope.scheduler = new Scheduler($scope);
			for (var i = 0; i < results.length; i++) {
				loadDMO(store, results[i].dmo.value);
			}
			loadMappings(store, renderingUri);
		});
	}
	
	function loadDMO(store, dmoUri, parentDMO) {
		var dmo = new DynamicMusicObject(dmoUri, $scope.scheduler);
		dmos[dmoUri] = dmo;
		if (parentDMO) {
			parentDMO.addChild(dmo);
		} else {
			$scope.rendering.dmo = dmo; //pass top-level dmo to rendering
		}
		loadAudioPath(store, dmoUri, dmo);
		loadParameters(store, dmoUri, dmo);
		loadChildren(store, dmoUri, dmo);
	}
	
	function loadAudioPath(store, dmoUri, dmo) {
		store.execute("SELECT ?audioPath \
		WHERE { <"+dmoUri+"> <"+mobileRdfUri+"#hasAudioPath> ?audioPath }", function(err, results) {
			for (var i = 0; i < results.length; i++) {
				var audioPath = dmoPath+"/"+results[i].audioPath.value;
				dmo.setSourcePath(audioPath);
				$scope.scheduler.addSourceFile(audioPath);
			}
		});
	}
	
	function loadParameters(store, dmoUri, dmo) {
		store.execute("SELECT ?parameter ?parameterType ?value ?featuresPath ?graphPath ?label \
		WHERE { <"+dmoUri+"> <"+mobileRdfUri+"#hasParameter> ?parameter . \
		OPTIONAL { ?parameter a ?parameterType . \
			?parameter <"+mobileRdfUri+"#hasValue> ?value . } \
		OPTIONAL { ?parameter <"+mobileRdfUri+"#hasFeaturesPath> ?featuresPath . } \
		OPTIONAL { ?parameter <"+mobileRdfUri+"#hasGraphPath> ?graphPath . } \
		OPTIONAL { ?parameter <"+rdfsUri+"#label> ?label . } }", function(err, results) {
			for (var i = 0; i < results.length; i++) {
				var label = getValue(results[i].label);
				var value = getNumberValue(results[i].value);
				if (value) {
					var parameter = getParameter(dmo, results[i].parameter.value, results[i].parameterType.value);
					parameter.update(undefined, value);
				}
				if (results[i].featuresPath) {
					var featuresPath = dmoPath+"/"+results[i].featuresPath.value;
					loadSegmentation(dmo, results[i].parameter.value, featuresPath, label);
				}
			}
			if (results.length <= 0) {
				$scope.ontologiesLoaded = true;
			}
		});
	}
	
	function loadChildren(store, dmoUri, dmo) {
		store.execute("SELECT ?child \
		WHERE { <"+dmoUri+"> <"+mobileRdfUri+"#hasChild> ?child }", function(err, results) {
			for (var i = 0; i < results.length; i++) {
				loadDMO(store, results[i].child.value, dmo);
			}
		});
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
		store.execute("SELECT ?mappingType ?dmo ?parameter ?parameterType \
		WHERE { <"+mappingUri+"> a ?mappingType . \
			<"+mappingUri+"> <"+mobileRdfUri+"#toParameter> ?parameter . \
		OPTIONAL { <"+mappingUri+"> <"+mobileRdfUri+"#toDMO> ?dmo . } \
		OPTIONAL { ?parameter a ?parameterType . } }", function(err, results) {
			for (var i = 0; i < results.length; i++) {
				if (results[i].dmo) {
					var dmo = dmos[results[i].dmo.value];
				}
				if (results[i].parameterType) {
					var parameterType = results[i].parameterType.value;
				}
				var parameter = getParameter(dmo, results[i].parameter.value, parameterType);
				loadMappingDimensions(store, mappingUri, results[i].mappingType.value, parameter);
			}
		});
	}
	
	function loadMappingDimensions(store, mappingUri, mappingType, parameter) {
		store.execute("SELECT ?control ?controlType ?label ?function ?functionType ?position ?range ?multiplier ?addend ?modulus \
		WHERE { <"+mappingUri+"> <"+mobileRdfUri+"#hasDimension> ?dimension . \
			?dimension <"+mobileRdfUri+"#fromControl> ?control . \
		OPTIONAL {	?dimension <"+mobileRdfUri+"#withFunction> ?function . \
			?function a ?functionType . } \
		OPTIONAL { ?control a ?controlType . } \
		OPTIONAL { ?control <"+rdfsUri+"#label> ?label . } \
		OPTIONAL { ?dimension <"+mobileRdfUri+"#hasMultiplier> ?multiplier . } \
		OPTIONAL { ?dimension <"+mobileRdfUri+"#hasAddend> ?addend . } \
		OPTIONAL { ?dimension <"+mobileRdfUri+"#hasModulus> ?modulus . } \
		OPTIONAL { ?function <"+mobileRdfUri+"#atPosition> ?position . } \
		OPTIONAL { ?function <"+mobileRdfUri+"#hasRange> ?range . } }", function(err, results) {
			var controls = [];
			var functions = [];
			var multipliers = [];
			var addends = [];
			var moduli = [];
			for (var i = 0; i < results.length; i++) {
				controls[i] = getControlFromResults(results[i].control, results[i].controlType, results[i].label);
				var position = getNumberValue(results[i].position);
				var range = getNumberValue(results[i].range);
				functions[i] = getFunction(results[i].functionType, position, range);
				multipliers[i] = getNumberValue(results[i].multiplier, 1);
				addends[i] = getNumberValue(results[i].addend, 0);
				moduli[i] = getNumberValue(results[i].modulus);
			}
			$scope.mappings[mappingUri] = new Mapping(controls, functions, multipliers, addends, moduli, parameter);
			$scope.mappingLoadingThreads--;
			$scope.$apply();
		});
	}
	
	function getFunction(functionTypeResult, position, range) {
		if (functionTypeResult) {
			functionType = functionTypeResult.value;
			if (functionType == mobileRdfUri+"#TriangleFunction") {
				return new TriangleFunction(position, range);
			} else if (functionType == mobileRdfUri+"#RectangleFunction") {
				return new RectangleFunction(position, range);
			}
		}
		return new LinearFunction();
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
		return getControl(control, controlType, label);
	}
	
	function getValue(result) {
		if (result) {
			return result.value;
		}
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
		} else if (controlUri == mobileRdfUri+"#TiltX") {
			return getAccelerometerControl(3);
		} else if (controlUri == mobileRdfUri+"#TiltY") {
			return getAccelerometerControl(4);
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
		} else if (controlUri == mobileRdfUri+"#Random" || controlTypeUri == mobileRdfUri+"#Random") {
			return getStatsControl(0);
		} else if (controlTypeUri == mobileRdfUri+"#GraphControl") {
			return getGraphControl(0);
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
		} else if (index == 2){
			return $scope.accelerometerWatcher.zControl;
		} else if (index == 3){
			return $scope.accelerometerWatcher.tiltXControl;
		} else if (index == 4){
			return $scope.accelerometerWatcher.tiltYControl;
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
	
	function getGraphControl(index) {
		if (!$scope.graphControls) {
			$scope.graphControls = new GraphControls();
		}
		if (index == 0) {
			return $scope.graphControls.nextNodeControl;
		}
	}
	
	function getParameter(dmo, parameterUri, parameterTypeUri) {
		if (parameterUri == mobileRdfUri+"#Amplitude" || parameterTypeUri == mobileRdfUri+"#Amplitude") {
			return dmo.amplitude;
		} else if (parameterUri == mobileRdfUri+"#Pan" || parameterTypeUri == mobileRdfUri+"#Pan") {
			return dmo.pan;
		}	else if (parameterUri == mobileRdfUri+"#Distance" || parameterTypeUri == mobileRdfUri+"#Distance") {
			return dmo.distance;
		} else if (parameterUri == mobileRdfUri+"#Reverb" || parameterTypeUri == mobileRdfUri+"#Reverb") {
			return dmo.reverb;
		} else if (parameterTypeUri == mobileRdfUri+"#Segmentation") {
			return dmo.segmentIndex;
		} else if (parameterUri == mobileRdfUri+"#SegmentDurationRatio" || parameterTypeUri == mobileRdfUri+"#SegmentDurationRatio") {
			return dmo.segmentDurationRatio;
		} else if (parameterUri == mobileRdfUri+"#ListenerOrientation" || parameterTypeUri == mobileRdfUri+"#ListenerOrientation") {
			return $scope.rendering.listenerOrientation;
		} else if (parameterUri == mobileRdfUri+"#StatsFrequency" || parameterTypeUri == mobileRdfUri+"#StatsFrequency") {
			if (!$scope.statsControls) {
				$scope.statsControls = new StatsControls($interval);
			}
			return $scope.statsControls.frequency;
		}
	}
	
	var eventOntology = "http://purl.org/NET/c4dm/event.owl";
	var timelineOntology = "http://purl.org/NET/c4dm/timeline.owl";
	
	function loadSegmentation(dmo, parameterUri, rdfUri) {
		//console.log("start");
		$scope.featureLoadingThreads++;
		$http.get(rdfUri).success(function(data) {
			//console.log("get");
			rdfstore.create(function(err, store) {
				//console.log("create");
				store.load('text/turtle', data, function(err, results) {
					//console.log("load");
					if (err) {
						console.log(err);
					}
					//for now looks at anything containing event times
					//?eventType <"+rdfsUri+"#subClassOf>* <"+eventOntology+"#Event> . \
					store.execute("SELECT ?xsdTime \
					WHERE { ?event a ?eventType . \
					?event <"+eventOntology+"#time> ?time . \
					?time <"+timelineOntology+"#at> ?xsdTime }", function(err, results) {
						//console.log("execute");
						var times = [];
						for (var i = 0; i < results.length; i++) {
							times.push(toSecondsNumber(results[i].xsdTime.value));
						}
						dmo.setSegmentation(times.sort(function(a,b){return a - b}));
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