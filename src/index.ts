import WDIOReporter, {AfterCommandArgs, SuiteStats} from '@wdio/reporter';
import logger from '@wdio/logger'
import {v4 as uuidv4} from 'uuid';
import fs from 'fs';
import path from 'path';
import {removeSync} from 'fs-extra/lib/remove';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import {execSync} from 'child_process';

const log = logger('wdio-testrecorder-reporter');

const DEFAULT_VIDEO_OUTPUT_FOLDER = '../../../tmp/';
const DEFAULT_JSON_WIRE_ACTION = '../default/wdioCommand.json';
const DEFAULT_ATTACH_VIDEO_TO_CUCUMBER_REPORT = false;
const DEFAULT_REMOVE_ATTACHED_VIDEOS = false;

let testId = null;
let scenarioName = null;
let imageCapturedCount = 0;

export default class TestRecoder extends WDIOReporter {
    framework: string;
    videoOutputPath: string
    constructor(options) {
        super(options);

        // Store video output in given path
        if (!options.videoOutputPath) {
            this.videoOutputPath = path.join(__dirname, DEFAULT_VIDEO_OUTPUT_FOLDER);
            log.warn(`The 'videoOutputPath' was not set, it has been set to the default '${this.videoOutputPath}'`);
        } else {
            this.videoOutputPath = options.videoOutputPath;
        }

        // Determine whether to attach video to cucumber tests
        if (typeof options.attachVideoToCucumberReport === 'boolean') {
            if (!options.attachVideoToCucumberReport) {
                options.attachVideoToCucumberReport = DEFAULT_ATTACH_VIDEO_TO_CUCUMBER_REPORT;
            }
        } else {
            options.attachVideoToCucumberReport = DEFAULT_ATTACH_VIDEO_TO_CUCUMBER_REPORT;
            log.warn(`'attachVideoToCucumberReport' received unsuported parameter, it has been set to the default '${DEFAULT_ATTACH_VIDEO_TO_CUCUMBER_REPORT}'`);
        }

        // Determine whether to attach video ahould be removed or not
        if (typeof options.removeAttachedVideos === 'boolean') {
            if (!options.removeAttachedVideos) {
                options.removeAttachedVideos = DEFAULT_REMOVE_ATTACHED_VIDEOS;
            }
        } else {
            options.removeAttachedVideos = DEFAULT_REMOVE_ATTACHED_VIDEOS;
            log.warn(`'removeAttachedVideos' received unsuported parameter, it has been set to the default '${DEFAULT_REMOVE_ATTACHED_VIDEOS}'`);
        }

        options.jsonWireCommands = DEFAULT_JSON_WIRE_ACTION;
    }

    onSuiteStart(suiteStats: SuiteStats): void {
        const suite = JSON.parse(JSON.stringify(suiteStats));
        if (suite.type === 'scenario') {
            testId = uuidv4();
            scenarioName = suite.title;
            scenarioName = scenarioName.replace(/[^a-zA-Z]/g, '_');
            scenarioName = scenarioName.trim();
            // initialize empty dir for storing images and videos
            if (!fs.existsSync(`${this.videoOutputPath}`)) {
                fs.mkdirSync(`${this.videoOutputPath}`);
            }
        }

    }

    onAfterCommand(commandArgs: AfterCommandArgs): void {
        const command = commandArgs.endpoint.substring(commandArgs.endpoint.lastIndexOf('/') + 1).trim();
        const actions = JSON.parse((fs.readFileSync(path.resolve(path.join(__dirname, this.options.jsonWireCommands)))).toString())
        if (actions.jsonWireActions.includes(command)) {
            const videoOutputPath = path.resolve(this.videoOutputPath);
            const imageName = 'img' + imageCapturedCount.toString().padStart(3, '0');
            const fileName = `${videoOutputPath}/${testId}-${scenarioName}/` + imageName + '.png';
            if (testId !== null && scenarioName !== null) {
                if (!fs.existsSync(`${videoOutputPath}/${testId}-${scenarioName}`)) {
                    fs.mkdirSync(`${videoOutputPath}/${testId}-${scenarioName}`);
                }
                //@ts-expect-error
                browser.saveScreenshot(fileName)
                imageCapturedCount++;
            }
        }
    }

    onSuiteEnd(suiteStats: SuiteStats): void {
        const suite = JSON.parse(JSON.stringify(suiteStats));
        if (suite.type === 'scenario') {
            const videoOutputPath = path.resolve(this.videoOutputPath);
            const imagePath = `${videoOutputPath}/${testId}-${scenarioName}/img%03d.png`;
            const videoPath = `${videoOutputPath}/videos/${testId}-${scenarioName}.mp4`;
            if (!fs.existsSync(`${videoOutputPath}/videos/`)) {
                fs.mkdirSync(`${videoOutputPath}/videos`);
            }
            if (fs.existsSync(`${videoPath}`)) {
                removeSync(`${videoPath}`);
            }
            try {
                const command = `${ffmpeg.path} -y -r 10 -i ${imagePath} -vcodec libx264 -crf 32 -pix_fmt yuv420p -vf "scale=1200:trunc(ow/a/2)*2","setpts=3.0*PTS" ${videoPath}`;
                //@ts-expect-error
                execSync(command, {stdio: 'ignore', shell: true, windowsHide: true});

                // Remove converted screenshot images
                removeSync(`${videoOutputPath}/${testId}-${scenarioName}`);
                
                // Converts the recorded video to base64 string.
                //@ts-expect-error
                const base64Video = new Buffer.from(fs.readFileSync(videoPath)).toString('base64');

                if (this.options.attachVideoToCucumberReport) {
                    //@ts-expect-error
                    (process.emit)( 'wdioCucumberJsReporter:attachment', {data: base64Video, type: 'video/mp4'} );
                }

                if (this.options.attachVideoToCucumberReport && this.options.removeAttachedVideos) {
                    // Remove attached video
                    removeSync(videoPath);
                }

            } catch (error) {
                log.error(error);
            }
        }
    }
}