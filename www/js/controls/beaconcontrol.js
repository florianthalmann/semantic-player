/**
 * A control based on the distance from a bluetooth beacon
 * @constructor
 * @extends {SensorControl}
 */
function BeaconControl(uuid, major, minor) {

	var self = this;

	SensorControl.call(this, BEACON,
		"$cordovaBeacon",
		null,
		function() {},
		null,
		null
	);

	this.startUpdate = function() {
		var region = self.getSensor().createBeaconRegion("smpBeacons", uuid)
		self.getSensor().startRangingBeaconsInRegion(region);
		self.getScope().$on("$cordovaBeacon:didRangeBeaconsInRegion", function(event, region) {
			for (var b in region.beacons) {
				b = region.beacons[b]
				if (b.major == major && b.minor == minor) {
					self.updateValue(b.accuracy);
				}
			}
		});
	}

}
inheritPrototype(BeaconControl, SensorControl);
