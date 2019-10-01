# wdio-testrecorder-reporter
A reporter for [WDIO v5](https://webdriver.io/) that generates videos of your wdio test executions.

This reporter uses [ffmpeg](https://www.ffmpeg.org/) to convert sequence of images to video.
## Installation

You can simple do it by:

```bash
npm install wdio-allure-reporter --save-dev
```

Instructions on how to install `WDIO` can be found [here](http://webdriver.io/guide/getstarted/install.html)

## Configuration
Configure the output directory in your wdio.conf.js file:

```js
exports.config = {
    // ...
    reporters: ['testRecorder', {videoOutputPath: '', savePassedVideo: false, jsonWireCommands: '', framerate: ''}]
  // ...
}
```

- `videoOutputPath` - Output folder path to store reports.
- `savePassedVideo` - Enable video storage for passed tests.
- `jsonWireCommands` - Optional. Defaults to `default/wdioCommand.json`. 
- `framerate` - Optional, range varies from 1 to 50. Defaults to `3.5`. 

## Cucumber JSON Report Integration
Below method can be used to attach saved video to cucumber json reports. Installation and implementation of `wdio-cucumberjs-json-reporter` can be found [here](https://www.npmjs.com/package/wdio-cucumberjs-json-reporter)

```js
const fs = require('fs');
const path = require('path');
const cucumberJson = require('wdio-cucumberjs-json-reporter').default;

let videoFilePath = fs.readFileSync(path.resolve(`${videoOutputPath}/video/${scenarioName}.mp4`));
let base64Video = new Buffer(videoFilePath).toString('base64');
return cucumberJson.attach(base64Video, 'video/mp4');
```

## Limitations
It capture screenshots for each and every json wire protocol commands provided. Which obliviously reduces your test execution speed.
