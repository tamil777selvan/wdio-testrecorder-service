"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _reporter = _interopRequireDefault(require("@wdio/reporter"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _fsExtra = require("fs-extra");

var _ffmpeg = _interopRequireDefault(require("@ffmpeg-installer/ffmpeg"));

var _child_process = _interopRequireDefault(require("child_process"));

var _systemSleep = _interopRequireDefault(require("system-sleep"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_VIDEO_OUTPUT_FOLDER = '.tmp/video/';
const DEFAULT_SAVE_PASSED_VIDEO = false;
const DEFAULT_JSON_WIRE_ACTION = '../default/wdioCommand.json';
const DEFAULT_FRAME_RATE = 3.5;
let imageCount = 0;
let scenarioName;

class testrecorder extends _reporter.default {
  constructor(options) {
    super(options);

    if (!options.videoOutputPath) {
      options.videoOutputPath = DEFAULT_VIDEO_OUTPUT_FOLDER; // eslint-disable-next-line no-console

      console.log(`The 'videoOutputPath' was not set, it has been set to the default '${DEFAULT_VIDEO_OUTPUT_FOLDER}'`);
    }

    if (typeof options.savePassedVideo === 'boolean') {
      if (options.savePassedVideo) {
        options.savePassedVideo = options.savePassedVideo;
      } else {
        options.savePassedVideo = DEFAULT_SAVE_PASSED_VIDEO;
      }
    } else {
      options.savePassedVideo = DEFAULT_SAVE_PASSED_VIDEO; // eslint-disable-next-line no-console

      console.log(`'savePassedVideo' received unsuported parameter, it has been set to the default '${DEFAULT_SAVE_PASSED_VIDEO}'`);
    }

    if (!options.jsonWireCommands) {
      options.jsonWireCommands = DEFAULT_JSON_WIRE_ACTION; // eslint-disable-next-line no-console

      console.log('The \'jsonWireCommands\' was not set, it has been set to the default configurations');
    } else {
      options.jsonWireCommands = options.jsonWireCommands;
    }

    if (!options.framerate) {
      options.framerate = DEFAULT_FRAME_RATE; // eslint-disable-next-line no-console

      console.log('The \'framerate\' was not set, it has been set to the default configurations');
    } else {
      options.framerate = options.framerate;
    }
  }

  onSuiteStart(suiteStartObject) {
    let suiteObject = JSON.stringify(suiteStartObject);
    suiteObject = JSON.parse(suiteObject);

    if (suiteObject.type === 'scenario') {
      scenarioName = suiteObject.title;
      scenarioName = scenarioName.replace(/ /g, '_');
      scenarioName = scenarioName.trim();
    }

    if (!_fs.default.existsSync(`${this.options.videoOutputPath}`)) {
      _fs.default.mkdirSync(`${this.options.videoOutputPath}`);
    }
  }

  onAfterCommand(afterCommandObject) {
    let commandPerformed = afterCommandObject.endpoint;
    commandPerformed = commandPerformed.substring(commandPerformed.lastIndexOf('/') + 1);
    commandPerformed = commandPerformed.trim();
    let actions;

    if (this.options.jsonWireCommands === DEFAULT_JSON_WIRE_ACTION) {
      actions = _fs.default.readFileSync(_path.default.resolve(_path.default.join(__dirname, this.options.jsonWireCommands)));
      actions = actions.toString();
      actions = JSON.parse(actions);
    } else {
      actions = _fs.default.readFileSync(_path.default.resolve(this.options.jsonWireCommands));
      actions = actions.toString();
      actions = JSON.parse(actions);
    }

    if (actions.jsonWireActions.includes(commandPerformed)) {
      let videoOutputPath = _path.default.resolve(this.options.videoOutputPath);

      let imageName = 'img' + imageCount.toString().padStart(3, '0');
      let fileName = `${videoOutputPath}/${scenarioName}/` + imageName + '.png';

      if (!_fs.default.existsSync(`${videoOutputPath}/${scenarioName}`)) {
        _fs.default.mkdirSync(`${videoOutputPath}/${scenarioName}`);
      }

      (0, _systemSleep.default)(100);
      browser.saveScreenshot(fileName);
      (0, _systemSleep.default)(1000);
      imageCount++;
    }
  }

  onSuiteEnd(suiteEndObject) {
    let suiteObject = JSON.stringify(suiteEndObject);
    suiteObject = JSON.parse(suiteObject);

    if (suiteObject.type === 'scenario') {
      let resultObject = [];
      suiteObject.tests.forEach(element => {
        resultObject.push(element.state);
      });
      (0, _systemSleep.default)(900);

      let videoOutputPath = _path.default.resolve(this.options.videoOutputPath);

      let imagePath = `${videoOutputPath}/${scenarioName}/img%03d.png`;
      let videoPath = `${videoOutputPath}/videos/${scenarioName}.mp4`;

      if (!_fs.default.existsSync(`${videoOutputPath}/videos/`)) {
        _fs.default.mkdirSync(`${videoOutputPath}/videos`);
      }

      if (_fs.default.existsSync(`${videoPath}`)) {
        (0, _fsExtra.removeSync)(`${videoPath}`);
      }

      try {
        let videoRecordingCommand = `${_ffmpeg.default.path} -framerate ${this.options.framerate} -i ${imagePath} -vf scale=2880x1312 -pix_fmt yuv420p ${videoPath}`;
        
        // escaping bad args
        var escapedCmd = videoRecordingCommand.split(" ");
        var fileArg = escapedCmd.shift();
        _child_process.default.execFile(fileArg, escapedCmd);
      } catch (e) {
        (0, _systemSleep.default)(900);
      }

      if (this.options.savePassedVideo) {
        (0, _fsExtra.removeSync)(`${videoOutputPath}/${scenarioName}`);
      } else {
        (0, _fsExtra.removeSync)(`${videoOutputPath}/${scenarioName}`);

        if (resultObject.includes('passed') && !resultObject.includes('failed')) {
          (0, _fsExtra.removeSync)(`${this.options.videoOutputPath}/videos/${scenarioName}.mp4`);
        }
      }
    }
  }

}

exports.default = testrecorder;
