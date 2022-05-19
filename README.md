# wdio-testrecorder-service
A service for [WDIO](https://webdriver.io/) that generates videos of your wdio cucumber test executions.

This service uses [ffmpeg](https://www.ffmpeg.org/) to convert sequence of images to video.
## Installation

You can simple do it by:

```bash
npm i wdio-testrecorder-service
```

Instructions on how to install `WDIO` can be found [here](http://webdriver.io/guide/getstarted/install.html)

## Configuration
Configure the output directory in your wdio.conf.js file:

```js
exports.config = {
    // ...
    services: [
      [
        'TestRecorder', {
            attachVideoToCucumberReport: true
        }
      ]
    ]
  // ...
}
```
Options to override default capabilities...

- `videoOutputPath` - Output folder path to store video reports.
- `attachVideoToCucumberReport` - Attach the recorded video to cucumber reports.
- `removeAttachedVideos` - Delete the saved video from temp file once attacted to cucumber reports.
- `jsonWireActions` - Array of string for which screenshots needs to be captured in `afterCommad` hooks.


**Note:**
 -  `attachVideoToCucumberReport` will work only if [cucumberjs-json](https://www.npmjs.com/package/wdio-cucumberjs-json-reporter) reporter is enabled. Existance of cucumber report is not validated. So, before enabling `removeAttachedVideos` as `true` make sure you have the cucumber reporter enabled. Else would endup in lossing the video generated.

## Default Values:

  - videoOutputPath - `./tmp`
  - attachVideoToCucumberReport - `false`
  - removeAttachedVideos - `false`
  - jsonWireActions - 
  
  ```js
  [
    "executeScript",
    "elementClick",
    "click",
    "elementClear",
    "clearValue",
    "setValueImmediate",
    "pressKeyCode",
    "hideKeyboard",

    "url",
    "performActions",
    "releaseActions",
    "keys",
    "doubleClick",
    "execute",
    "scrollIntoView",
    "dragAndDrop",
    "elementSendKeys",
    "addValue",
    "setValue",
    "moveTo",
    "selectByIndex",
    "selectByAttribute",
    "selectByVisibleText",

    "waitForDisplayed",
    "waitForExist",
    "waitForEnabled",
    "switchToWindow",
    "closeWindow"
  ]
  ```
  
## Limitations
Since this service captures screenshot in runtime increases the execution timeline.
