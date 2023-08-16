/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const pkg = require('../../package.json');
const path =require('path')
const jarUrl = `odc-build/${pkg.version}/jar/odc-slim.jar`;
const pluginUrl = `odc-build/${pkg.version}/plugins`;
const startersUrl = `odc-build/${pkg.version}/starters`;
const { oss } = require('./util');
const isSkipJar = process.env.ODC_BUILD_SKIP_JAR;

exports.run = async function () {
  if (isSkipJar) {
    return true;
  }
  const plugins = await oss.getOSSFolderFiles(pluginUrl)
  for (let plugin of plugins) {
    const pluginFileName = path.relative(pluginUrl, plugin.name);
    const isSuccess = await oss.download(plugin.name, 'libraries/java/plugins', pluginFileName);
    if (!isSuccess) {
      console.error('Download plugin failed', pluginFileName)
      process.exit(-1);
    }
  }
  /**
   * starters
   */
  const starters = await oss.getOSSFolderFiles(startersUrl)
  for (let starter of starters) {
    const fileName = path.relative(startersUrl, starter.name);
    const isSuccess = await oss.download(starter.name, 'libraries/java/starters', fileName);
    if (!isSuccess) {
      console.error('Download starters failed', fileName)
      process.exit(-1);
    }
  }
  await oss.download(jarUrl, 'libraries/java', 'odc.jar');
};

