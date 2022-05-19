
export interface TestRecoderConfig {
    /**
     * defalut output path to store video files
     * @default '../../../tmp/'
    */
    videoOutputPath?: string
    /**
     * attach video to cucumber report
     * @default false
    */
    attachVideoToCucumberReport?: boolean
    /**
     * once the video is attached remove from videoOutputPath
     * @default false
    */
    removeAttachedVideos?: boolean
    /**
     * defalut path for json wire command
    */
    jsonWireActions: string[]
}