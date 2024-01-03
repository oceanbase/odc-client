/*
 * Copyright 2024 OceanBase
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
const path = require('path');
const config = require('./config');
const OSS = require('ali-oss')


class OSSUtil {
    oss = null;
    constructor() {
        this.oss = new OSS({
            ...config
        });
    }
    async uploadFile(ossPath, uploadFilePath) {
        const uploadFileName = path.basename(uploadFilePath);
        const ossFilePath = path.resolve(ossPath, uploadFileName);
        const ins = this.oss;
        try {
            const res = await ins.put(ossFilePath, fs.createReadStream(uploadFilePath))
            if (res.res?.status === 200) {
                return true
            } else {
                console.error(`[Upload Failed]\nFilePath: ${uploadFilePath} \n `);
                console.error(res?.res);
                return false;
            }
        }
        catch (e) {
            console.error(`[Upload Failed]\nFilePath: ${uploadFilePath}\n ${e}`);
            return false;
        }
    }

    async uploadFolder(ossPath, uploadFolderPath) {
        const files = await this.getFolderFiles(uploadFolderPath);
        const results = new Map();
        console.log(`准备开始上传, 总数：${files?.length}`)
        for (let filePath of files) {
            /**
             * 文件在oss上的相对路径
             */
            const relativeFilePath = path.relative(uploadFolderPath, filePath);
            /**
             * 文件在oss上的目录相对路径
             */
            const relativePath = path.dirname(relativeFilePath)
            /**
             * 文件在oss上的实际目录
             */
            const ossFilePath = path.join(ossPath, relativePath);
            const isSuccesss = await this.uploadFile(ossFilePath, filePath)
            if (isSuccesss) {
                results.set(relativeFilePath, isSuccesss);
            } else {
                console.error(`上传失败(${results.size}/${files?.length})`)
                return false;
            }
            if (results.size%200 === 0) {
                console.log('已上传: ', results.size)
            }
        }
        console.log(`上传完成, 总数：${files?.length}`)
        return true;
    }

    async getFolderFiles(folderPath, files) {
        files = files || [];
        const folders = fs.readdirSync(folderPath);
        for (let i = 0; i < folders.length; i++) {
            const filePath = folders[i];
            const fileRealPath = path.join(folderPath, filePath);
            const stat = fs.lstatSync(fileRealPath);
            if (stat.isDirectory()) {
                await this.getFolderFiles(fileRealPath, files);
            } else {
                files.push(fileRealPath);
            }
        }
        return files;
    }


    async deleteOSSFiles(fileNames) {
        let offset = 0;
        const step = 900;
        let deleted = 0;
        while (true) {
            try {

                const currentFileNames = fileNames.slice(offset, offset + step);
                offset = step + offset;
                if (!currentFileNames.length) {
                    /**
                     * 全部删除了
                     */
                    return true;
                }
                const res = await this.oss.deleteMulti(currentFileNames, { quiet: true });
                deleted = deleted + currentFileNames.length;
                if (res?.deleted?.length) {
                    console.error(`[Delete failed]\Success: ${deleted - res?.deleted?.length} All: ${fileNames?.length}`)
                    return false;
                }
            } catch (e) {
                console.error(e);
                return false;
            }
        }
    }


    /**
     * 
     * @param {*} ossPath 
     */
    async getOSSFolderFiles(ossPath, nextToken) {
        const realOSSPath = path.relative('/', ossPath);
        let result = [];
        try {
            const res = await this.oss.listV2({
                prefix: realOSSPath,
                'max-keys': 1000,
                'continuation-token': nextToken
            });
            if (!res.status === 200) {
                console.error(res)
                return null;
            }
            result = result.concat(res.objects);
            const nextContinuationToken = res?.nextContinuationToken;
            if (nextContinuationToken) {
                const objects = await this.getOSSFolderFiles(ossPath, nextContinuationToken);
                if (objects === null) {
                    /**
                     * 上一个节点返回失败，则丢弃所有数据
                     */
                    return null;
                }
                result = result.concat(objects);
            }
            return result;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async deleteOSSFolder(ossPath) {
        try {
            const fileNames = await this.getOSSFolderFiles(ossPath);
            if (fileNames === null) {
                return null;
            }
            return await this.deleteOSSFiles(fileNames?.map(f => f.name));
        } catch(e) {
            console.error(e);
            return false
        }
    }

}

const ossUtil = new OSSUtil();
module.exports = ossUtil;
