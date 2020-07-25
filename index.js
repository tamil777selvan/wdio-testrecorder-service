import Reporter from '@wdio/reporter';
import path from 'path';
import fs from 'fs';
import {removeSync} from 'fs-extra';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import childProcess from 'child_process';
import sleep from 'system-sleep';

const DEFAULT_VIDEO_OUTPUT_FOLDER = '.tmp/video/';
const DEFAULT_SAVE_PASSED_VIDEO = false;
const DEFAULT_JSON_WIRE_ACTION = '../default/wdioCommand.json';
const DEFAULT_FRAME_RATE = 3.5;
let imageCount = 0;
let scenarioName;

export default class testrecorder extends Reporter {
    constructor(options) {
        super(options);
        if (!options.videoOutputPath) {
            options.videoOutputPath = DEFAULT_VIDEO_OUTPUT_FOLDER;
            // eslint-disable-next-line no-console
            console.log(`The 'videoOutputPath' was not set, it has been set to the default '${DEFAULT_VIDEO_OUTPUT_FOLDER}'`);
        }
        if (typeof options.savePassedVideo === 'boolean') {
            if (options.savePassedVideo) {
                options.savePassedVideo = options.savePassedVideo;
            } else {
                options.savePassedVideo = DEFAULT_SAVE_PASSED_VIDEO;
            }
        } else {
            options.savePassedVideo = DEFAULT_SAVE_PASSED_VIDEO;
            // eslint-disable-next-line no-console
            console.log(`'savePassedVideo' received unsuported parameter, it has been set to the default '${DEFAULT_SAVE_PASSED_VIDEO}'`);
        }
        if (!options.jsonWireCommands) {
            options.jsonWireCommands = DEFAULT_JSON_WIRE_ACTION;
            // eslint-disable-next-line no-console
            console.log('The \'jsonWireCommands\' was not set, it has been set to the default configurations');
        } else {
            options.jsonWireCommands = options.jsonWireCommands;
        }
        if (!options.framerate) {
            options.framerate = DEFAULT_FRAME_RATE;
            // eslint-disable-next-line no-console
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
        if (!fs.existsSync(`${this.options.videoOutputPath}`)) {
            fs.mkdirSync(`${this.options.videoOutputPath}`);
        }
    }

    onAfterCommand(afterCommandObject) {
        let commandPerformed = afterCommandObject.endpoint;
        commandPerformed = commandPerformed.substring(commandPerformed.lastIndexOf('/') + 1);
        commandPerformed = commandPerformed.trim();
        let actions;
        if (this.options.jsonWireCommands === DEFAULT_JSON_WIRE_ACTION) {
            actions = fs.readFileSync(path.resolve(path.join(__dirname, this.options.jsonWireCommands)));
            actions = actions.toString();
            actions = JSON.parse(actions);
        } else {
            actions = fs.readFileSync(path.resolve(this.options.jsonWireCommands));
            actions = actions.toString();
            actions = JSON.parse(actions);
        }
        if (actions.jsonWireActions.includes(commandPerformed)) {
            let videoOutputPath = path.resolve(this.options.videoOutputPath);
            let imageName = 'img' + imageCount.toString().padStart(3, '0');
            let fileName = `${videoOutputPath}/${scenarioName}/` + imageName + '.png';
            if (!fs.existsSync(`${videoOutputPath}/${scenarioName}`)) {
                fs.mkdirSync(`${videoOutputPath}/${scenarioName}`);
            }
            sleep(100);
            browser.saveScreenshot(fileName);
            sleep(1000);
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
            sleep(900);
            let videoOutputPath = path.resolve(this.options.videoOutputPath);
            let imagePath = `${videoOutputPath}/${scenarioName}/img%03d.png`;
            let videoPath = `${videoOutputPath}/videos/${scenarioName}.mp4`;
            if (!fs.existsSync(`${videoOutputPath}/videos/`)) {
                fs.mkdirSync(`${videoOutputPath}/videos`);
            }
            if (fs.existsSync(`${videoPath}`)) {
                removeSync(`${videoPath}`);
            }
            try {
                let videoRecordingCommand = `${ffmpeg.path} -framerate ${this.options.framerate} -i ${imagePath} -vf scale=2880x1312 -pix_fmt yuv420p ${videoPath}`;
                
                // escaping bad arguments
                var escapedCmd = videoRecordingCommand.split(" ");
                var fileArg = escapedCmd.shift();
                childProcess.execFile(fileArg, escapedCmd);
            } catch (e) {
                sleep(900);
            }

            if (this.options.savePassedVideo) {
                removeSync(`${videoOutputPath}/${scenarioName}`);
            } else {
                removeSync(`${videoOutputPath}/${scenarioName}`);
                if (resultObject.includes('passed') && !(resultObject.includes('failed'))) {
                    removeSync(`${this.options.videoOutputPath}/videos/${scenarioName}.mp4`);
                }
            }

        }
    }
}
