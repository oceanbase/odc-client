/**
 * 获取唯一标识号
 */

const DEFAULT_VERSION = '1818'
function getVersion() {
  try {
    const { spawnSync } = require('child_process');
    const git = spawnSync('git', ['version']);
    if (git.error) {
      return DEFAULT_VERSION;
    }
    const commitDate = spawnSync('git', ['show', '-s', '--format=%cd']);
    if (commitDate.error || !commitDate.stdout) {
      return DEFAULT_VERSION;
    }
    const d = new Date(commitDate.stdout.toString());
    return `${d.getTime()}`;
  } catch (e) {
    console.error(e);
    return DEFAULT_VERSION;
  }
}
module.exports = getVersion;
