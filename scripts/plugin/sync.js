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

const fs = require('fs');


exports.watch = function (sourceFile, targetFile) {
// 监听源文件的变化
fs.watchFile(sourceFile, (curr, prev) => {
    console.log(sourceFile, '-- File modified --');
  
    // 读取源文件的内容
    fs.readFile(sourceFile, 'utf8', (error, data) => {
      if (error) {
        console.log(`Error reading file: ${error}`);
      } else {
        // 将源文件的内容写入目标文件
        fs.writeFile(targetFile, data, 'utf8', (error) => {
          if (error) {
            console.log(`Error writing file: ${error}`);
          } else {
            console.log(`File synchronized: ${targetFile}`);
          }
        });
      }
    });
  });
}

