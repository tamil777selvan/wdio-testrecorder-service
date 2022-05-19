import type {TestRecoderConfig} from './types'
import path from 'path'

export const DEFAULT_OPTIONS: Partial<TestRecoderConfig> = {
    videoOutputPath: path.join(__dirname, '../../../tmp/'),
    attachVideoToCucumberReport: false,
    removeAttachedVideos: false,
    jsonWireActions: [
        'executeScript',
        'elementClick',
        'click',
        'elementClear',
        'clearValue',
        'setValueImmediate',
        'pressKeyCode',
        'hideKeyboard',

        'url',
        'performActions',
        'releaseActions',
        'keys',
        'doubleClick',
        'execute',
        'scrollIntoView',
        'dragAndDrop',
        'elementSendKeys',
        'addValue',
        'setValue',
        'moveTo',
        'selectByIndex',
        'selectByAttribute',
        'selectByVisibleText',

        'waitForDisplayed',
        'waitForExist',
        'waitForEnabled',
        'switchToWindow',
        'closeWindow'
    ]
}
