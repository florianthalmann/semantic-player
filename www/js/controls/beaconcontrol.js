/**
 * A control based on the distance from a bluetooth beacon
 * @constructor
 * @extends {SensorControl}
 */
function BeaconControl(uuid, major, minor) {
	
	uuid = "f7826da6-4fa2-4e98-8024-bc5b71e0893e";
	major = 51727;
	minor = 20124;
	
	var self = this;
	
	SensorControl.call(this, BEACON,
		"$cordovaBeacon",
		"$on",
		function(region) {
		}
	);
	
	this.startUpdate = function() {
		var region = self.getSensor().createBeaconRegion("estimote", uuid)
		self.getSensor().startRangingBeaconsInRegion(region);
		self.getScope().$on("$cordovaBeacon:didRangeBeaconsInRegion", function(event, region) {
			for (var b in region.beacons) {
				b = region.beacons[b]
				if (b.major == major && b.minor == minor) {
					console.log(b.major, b.minor, b.proximity, b.accuracy);
					self.update(b.accuracy);
				}
			}
		});
	}
	
}
inheritPrototype(BeaconControl, SensorControl);