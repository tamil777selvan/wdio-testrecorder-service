import logger from '@wdio/logger'
import type {Services} from '@wdio/types'
import {v4 as uuidv4} from 'uuid';
import fs from 'fs';
import path from 'path';
import {removeSync} from 'fs-extra/lib/remove';
import {writeFile} from 'fs/promises';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import {execSync} from 'child_process';

const log = logger('wdio-testrecorder-service');

import {TestRecoderConfig} from './types';
import {DEFAULT_OPTIONS} from './constants';

export default class TestRecoderService implements Services.ServiceInstance {
    private _bufferString: string
    private _options: TestRecoderConfig

    private _testId: string = uuidv4()
    private _imageCapturedCount: number = 0
    private _baseDirectory: string

    constructor(options: TestRecoderConfig) {
        this._options = {...DEFAULT_OPTIONS, ...options};
        this._baseDirectory = `${this._options.videoOutputPath}/${this._testId}`;
    }

    before(): void {
        if (!fs.existsSync(`${this._baseDirectory}/images`)) {
            fs.mkdirSync(`${this._baseDirectory}/images`, {recursive: true});
        }
    }

    async afterCommand (commandName: string) {
        const {jsonWireActions} = JSON.parse((fs.readFileSync(path.resolve(this._options.jsonWireActions))).toString());
        if (jsonWireActions.includes(commandName)) {
            const file = `${this._baseDirectory}/images/img${this._imageCapturedCount.toString().padStart(3, '0')}.png`;
            //@ts-expect-error
            this._bufferString = await browser.takeScreenshot();
            await writeFile(file, this._bufferString, {flag: 'a+', encoding: 'base64'});
            this._imageCapturedCount++;
        }
    }

    after(): void {
        try {
            const videoPath = `${this._baseDirectory}/report.mp4`;
            const imagePath = `${this._baseDirectory}/images/img%03d.png`;

            const command = `${ffmpeg.path} -y -r 10 -i ${imagePath} -vcodec libx264 -crf 32 -pix_fmt yuv420p -vf "scale=1200:trunc(ow/a/2)*2","setpts=3.0*PTS" ${videoPath}`;
            
            execSync(command, {stdio: 'ignore', windowsHide: true});

            // Remove converted screenshot images
            removeSync(`${this._baseDirectory}/images`);

            // Converts the recorded video to base64 string.
            const base64Video = Buffer.from(fs.readFileSync(videoPath)).toString('base64');

            if (this._options.attachVideoToCucumberReport) {
                //@ts-expect-error
                (process.emit)( 'wdioCucumberJsReporter:attachment', {data: base64Video, type: 'video/mp4'} );
            }

            if (this._options.attachVideoToCucumberReport && this._options.removeAttachedVideos) {
                // Remove attached video
                removeSync(videoPath);
            }

        } catch (error) {
            log.error(error);
        }
    }
}

declare global {
    namespace WebdriverIO {
        interface ServiceOption extends TestRecoderConfig {}
    }
}