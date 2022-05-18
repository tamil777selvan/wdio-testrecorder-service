import type {TestRecoderConfig} from './types'
import path from 'path'

export const DEFAULT_OPTIONS: Partial<TestRecoderConfig> = {
    videoOutputPath: path.join(__dirname, '../../../tmp/'),
    attachVideoToCucumberReport: false,
    removeAttachedVideos: false,
    jsonWireActions: path.join(__dirname, '../default/wdioCommand.json')
}
