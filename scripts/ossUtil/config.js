module.exports = {
    region: process.env.OSSUTIL_REGION,
    accessKeyId: process.env.OSSUTIL_AK,
    accessKeySecret: process.env.OSSUTIL_AS,
    bucket: process.env.OSSUTIL_BUCKET,
    timeout: 360 * 1000,
    endpoint: process.env.OSSUTIL_ENDPOINT
}