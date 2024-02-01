/**
 * 获取唯一标识号
 */
import pkg from '../package.json';

function getCommitId() {
  const DEFAULT_VERSION = '1818';
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

function getVersion() {
  const versionLeft = pkg.version;
  const commitId = getCommitId();
  return `${versionLeft}-${commitId}`;
}
module.exports = getVersion;
