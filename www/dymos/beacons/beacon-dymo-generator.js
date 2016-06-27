var centerBeaconRange = 0.5; //distance in meters at which the center beacon activates clean mode
var areaBeaconRange = 3; //distance in meters at which the audio associated with the beacon is no longer audible
var maxAmplitude = 0.5; //maximum amplitude at which each clip is played back
var uuid = "f7826da6-4fa2-4e98-8024-bc5b71e0893e";
var beacons = [
	{"major":51727,"minor":20124}, //this one is taken as the center beacon
	{"major":14437,"minor":16445}, //all following ones are assumed to be arranged clockwise
	{"major":12756,"minor":18735},
	{"major":97625,"minor":28753},
	{"major":14869,"minor":24875},
	{"major":29375,"minor":97634},
	{"major":23764,"minor":38754}
];
var dirtySoundFiles = [
	"pad.m4a",
	"piano.m4a",
	"blib.m4a",
	"drums.m4a",
	"bass.m4a",
	"flav.m4a"
];
var cleanSoundFiles = [
	"pad.m4a",
	"piano.m4a",
	"blib.m4a",
	"drums.m4a",
	"bass.m4a",
	"flav.m4a"
];

//generate dymo
var dymo = {
	"@context":"http://tiny.cc/dymo-context",
	"@id":"beacons",
	"@type":"Dymo",
	"cdt":"parallel",
	"parts":[{
		"@id":"dirty",
		"@type":"Dymo",
		"cdt":"parallel",
		"parts":[]
	},{
		"@id":"clean",
		"@type":"Dymo",
		"cdt":"parallel",
		"parts":[]
	}]
};
for (var i = 0; i < dirtySoundFiles.length; i++) {
	dymo["parts"][0]["parts"].push({
		"@id":"dirtyArea"+i,
		"@type":"Dymo",
		"source":dirtySoundFiles[i],
		"parameters":[
			{"@type":"Loop", "value":1},
			{"@type":"Amplitude", "value":1}
		]
	});
}
for (var i = 0; i < cleanSoundFiles.length; i++) {
	dymo["parts"][1]["parts"].push({
		"@id":"cleanArea"+i,
		"@type":"Dymo",
		"source":cleanSoundFiles[i],
		"parameters":[
			{"@type":"Loop", "value":1},
			{"@type":"Amplitude", "value":1}
		]
	});
}

//generate rendering
var rendering = {
	"@context":"http://tiny.cc/dymo-context",
	"@id":"beaconsRendering",
	"@type":"Rendering",
	"dymo":"beacons",
	"mappings":[]
};
//add mappings for center beacon
rendering["mappings"].push({
	"domainDims":[{
		"name":"centerBeacon",
		"@type":"Beacon",
		"uuid":uuid,
		"major":beacons[0].major,
		"minor":beacons[0].minor
	}],
	"function":{"args":["a"],"body":"return a<"+centerBeaconRange+"?"+maxAmplitude+":0;"},
	"dymos":["clean"],
	"range":"Amplitude"
});
rendering["mappings"].push({
	"domainDims":[{
		"name":"centerBeacon",
		"@type":"Beacon"
	}],
	"function":{"args":["a"],"body":"return a<"+centerBeaconRange+"?0:"+maxAmplitude+";"},
	"dymos":["dirty"],
	"range":"Amplitude"
});
//add mappings for beacon areas
for (var i = 0; i < dirtySoundFiles.length; i++) {
	rendering["mappings"].push({
		"domainDims":[{
			"name":"beacon"+i,
			"@type":"Beacon",
			"uuid":uuid,
			"major":beacons[i+1].major,
			"minor":beacons[i+1].minor
		}],
		"function":{"args":["a"],"body":"return Math.max("+areaBeaconRange+"-a, 0)/"+areaBeaconRange+"*"+maxAmplitude+";"},
		"dymos":["dirtyArea"+i],
		"range":"Amplitude"
	});
}
//add mappings for compass directions
compassRayWidth = 360 / cleanSoundFiles.length;
for (var i = 0; i < cleanSoundFiles.length; i++) {
	rendering["mappings"].push({
		"domainDims":[{
			"name":"compass",
			"@type":"CompassHeading",
			"average":3,
			"smooth":false
		}],
		"function":{"args":["a"],"body":"return ("+compassRayWidth/2+"-Math.min(Math.abs(a-"+i*cleanSoundFiles.length+"),"+compassRayWidth/2+"))/"+compassRayWidth/2+"*"+maxAmplitude+";"},
		"dymos":["cleanArea"+i],
		"range":"Amplitude"
	});
}

//write it all to files
var fs = require('fs');
fs.writeFile("www/dymos/beacons/dymo.json", JSON.stringify(dymo, null, '\t'), function(err) {
	console.log("Dymo saved");
});
fs.writeFile("www/dymos/beacons/rendering.json", JSON.stringify(rendering, null, '\t'), function(err) {
	console.log("Rendering saved");
}); 