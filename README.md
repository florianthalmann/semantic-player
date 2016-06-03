Semantic Music Player
=====================

A cross-platform mobile app built with Ionic that plays back dynamic music objects (dymos).

## Installing

First install [Bower](http://bower.io/#install-bower), [Cordova](https://cordova.apache.org/#getstarted), and [Ionic](http://ionicframework.com/getting-started) if you haven't yet:
```bash
$ npm install -g bower
$ npm install -g cordova
$ npm install -g ionic
```

Then clone the semantic-player project to your computer:
```bash
$ git clone https://github.com/florianthalmann/semantic-player.git
```

Go to the cloned project folder and run:
```bash
$ bower install
```
and finally:
```bash
$ ionic serve
```

Now you can navigate to http://localhost:8100 in your browser to view the example dymo.

## Running on a mobile device

First add the platform you are interested in, for example for Android:
```bash
$ ionic platform add android
```
Then run build, install, and run it using:
```bash
$ ionic run android
```

Check out the [Ionic docs](http://ionicframework.com/docs/cli/run.html) to find out how to run the app on other devices or emulators.

## Creating your own dymos

Add any of the [example dymos](https://github.com/florianthalmann/example-dymos.git) to the folder `www/dymos/` in the semantic-player project or build your own dymo, either by using the [Dymo Designer](https://github.com/florianthalmann/dymo-designer.git) or by defining files manually as described in the [dymo-core readme](https://github.com/florianthalmann/dymo-core.git).

Declare the added dymos in the `www/config.json` file by adding them to the `"dymos"` list.
