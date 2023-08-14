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

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');


const files = [
    path.resolve(process.cwd(), './src/locales/must/strings/zh-CN.json'),
    path.resolve(process.cwd(), './src/locales/must/strings/en-US.json'),
    path.resolve(process.cwd(), './src/locales/must/strings/zh-TW.json')
];

const result = new Set();

class Pool {
    workers = 0;
    MAX_WORKER = 100;
    tasks = [];
    isRunning = false;
    runTask(task) {
        this.tasks.push(task);
        this.beginWork();
    }
    async beginWork() {
        if (this.workers >= this.MAX_WORKER) {
            return;
        }
        const task = this.tasks.pop();
        if (!task) {
            return;
        }
        try {
            this.workers++;
            await task();
        } catch(e) {
            console.log('work error', e);
        } finally {
            this.workers--;
            this.beginWork();
        }
    }
}

const pool = new Pool();
console.time('during')
files.forEach(async filePath => {
    const text = fs.readFileSync(filePath);
    const json = JSON.parse(text);
    let runCount = 0;
    const keys = Object.keys(json)
    for (let key of keys) {
        pool.runTask(async function run () {
            if (!(await checkIsExist(key))) {
                result.add(key)
            }
            runCount++;
            console.log(runCount)
            if (runCount === keys.length) {
                writeResult();
                console.timeEnd('during')
            }
        })
    }
})

function writeResult() {
    fs.writeFileSync(
        path.resolve(process.cwd(), 'unusedLocale.json'),
            JSON.stringify(Array.from(result.keys()), null, 4)
        )
}
function checkIsExist(key) {
    return new Promise((resolve) => {
        const searchFolder = path.resolve(process.cwd(), 'src');
        try {
            exec(`grep -r --exclude-dir=locale --exclude-dir=.umi '${key}' ${searchFolder}  `, (error) => {
                if (error) {
                    result.add(key);
                    resolve(false)
                } else {
                    resolve(true)
                }
            })
        } catch(e) {
            console.log('catch', e)
            resolve(false)
        }
    })
    
}
