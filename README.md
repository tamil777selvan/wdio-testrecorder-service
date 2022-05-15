# wdio-testrecorder-reporter
A reporter for [WDIO](https://webdriver.io/) that generates videos of your wdio cucumber test executions.

This reporter uses [ffmpeg](https://www.ffmpeg.org/) to convert sequence of images to video.
## Installation

You can simple do it by:

```bash
npm i wdio-testrecorder-reporter
```

Instructions on how to install `WDIO` can be found [here](http://webdriver.io/guide/getstarted/install.html)

## Configuration
Configure the output directory in your wdio.conf.js file:

```js
exports.config = {
    // ...
    reporters: ['TestRecorder', {videoOutputPath: '', attachVideoToCucumberReport: true, removeAttachedVideos: false}]
  // ...
}
```

- `videoOutputPath` - Output folder path to store video reports.
- `attachVideoToCucumberReport` - Attach the recorded video to cucumber reports.
- `removeAttachedVideos` - Delete the saved video from temp file

Note:
  `attachVideoToCucumberReport` will work only if [cucumberjs-json](https://www.npmjs.com/package/wdio-cucumberjs-json-reporter) reporter is enabled
