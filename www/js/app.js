var $http = angular.injector(['ng']).get('$http');

angular.module('semanticplayer', ['ionic'])

.run(function($ionicPlatform, $rootScope) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
		
		var dmoUri = "audio/example";
		
		var rendering = new Rendering([dmoUri+"/voc.m4a", dmoUri+"/riddim.m4a", dmoUri+"/dnb.m4a"]);
		var accelerometerWatcher = new AccelerometerWatcher();
		$rootScope.slider1Controller = new Controller($rootScope);
		$rootScope.slider2Controller = new Controller($rootScope);
		
		new Mapping($rootScope.slider1Controller, rendering.tracks[1].distance);
		new Mapping($rootScope.slider2Controller, rendering.tracks[2].distance);
		new Mapping(accelerometerWatcher.xController, rendering.tracks[0].pan, -1);
		new Mapping(accelerometerWatcher.yController, rendering.tracks[0].distance, -1);
		
  });
})
