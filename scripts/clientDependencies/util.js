const path = require('path');
const request = require('request');
const fs = require('fs');
const OSS = require('ali-oss');
const ProgressBar = require('progress');


exports.download = async function (ossPath, saveDir, fileName) {
  return new Promise((resolve, reject) => {
    const savePath = path.resolve(saveDir, fileName);
    console.log('文件路径：', ossPath);

    if (!fs.existsSync(path.join(process.cwd(), saveDir))) {
      fs.mkdirSync(path.join(process.cwd(), saveDir), { recursive: true });
    }

    const file = fs.createWriteStream(savePath);
    file.on('open', () => {
      const sendReq = request.get(ossPath);
      sendReq.on('error', (err) => {
        console.trace(err);
        fs.unlinkSync(savePath);
        resolve(false);
      });
      sendReq.on('response', (response) => {
        if (response.statusCode !== 200) {
          throw new Error(`获取${ossPath}失败`, response);
        }
        let count = parseInt(response.headers["content-length"]);
        console.log('file length: ', count)
        var bar = new ProgressBar(`downloading [:bar] :current/${count} :percent :etas`, {
          total: 10,
          complete: '=',
          incomplete: ' ',
          width: 20,
          total: count
        });
        response.on('data', (data) => {
          bar.tick(data.length);
        });
        response.on('end', () => {
          console.log('received ' + (count / 1024 / 1024).toFixed(2) + ' MB');
        });
        sendReq.pipe(file);
      });
    });

    file.on('finish', () => {
      console.log(`下载 ${ossPath} 结束`);
      file.close();
      resolve(true);
    });

    file.on('error', (err) => {
      console.trace(err);
      fs.unlinkSync(savePath);
      resolve(false);
    });
  });
};

exports.oss = {
  getOSSIns: () => {
    return new OSS({
      endpoint: 'cn-hangzhou-alipay-b-internal.oss-internal.aliyun-inc.com',
      accessKeyId: process.env.OSS_ACCESS_KEY_ID || process.env.ACI_VAR_OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || process.env.ACI_VAR_OSS_ACCESS_KEY_SECRET,
      bucket: 'antsys-obodc-build',
      timeout: 360 * 1000
    })
  },
  download: async (ossPath, saveDir, fileName) => {
    const ins = this.oss.getOSSIns();
    const savePath = path.resolve(saveDir, fileName);
    if (!fs.existsSync(path.join(process.cwd(), saveDir))) {
      fs.mkdirSync(path.join(process.cwd(), saveDir), { recursive: true });
    }
    try {
      console.log(`Begin Download[${ossPath}]`)
      const result  = await ins.get(ossPath, savePath);
      if (result?.res?.status === 200) {
        console.log('End Download')
        return true;
      } else {
        console.log(`Download Failed[${ossPath}]`, result?.res?.status)
        return false;
      }
    } catch(e) {
      console.error(`Download Failed[${ossPath}]: `, e);
      return false;
    }
  },
  upload: async (ossPath, uploadFile) => {
    const ins = this.oss.getOSSIns();
    try {
      const res = await ins.put(path.join(ossPath, path.basename(uploadFile)), fs.createReadStream(uploadFile))
      if (res.res?.status === 200) {
        console.log('Upload Success')
        return true
      }
    }
    catch(e) {
      console.error('Upload Failed:', e);
      return false;
    }
    return false
  },
  checkIsExist: async (ossFilePath) => {
    const ins = this.oss.getOSSIns();
    try {
      const res = await ins.head(ossFilePath)
      if (res.res?.status === 200) {
        return true
      }
    }
    catch(e) {
      console.log('File not found:', e);
      return false;
    }
    return false
  },
  getOSSFolderFiles: async (ossPath, nextToken) => {
    const ins = this.oss.getOSSIns();
    const realOSSPath = ossPath
    let result = [];
    try {
      const res = await ins?.listV2({
        prefix: realOSSPath,
        'max-keys': 1000,
        'continuation-token': nextToken,
      });
      if (res?.res?.status !== 200) {
        console.error('error', res);
        return null;
      }
      result = result.concat(res.objects);
      const nextContinuationToken = res?.nextContinuationToken;
      if (nextContinuationToken) {
        const objects = await this.oss.getOSSFolderFiles(ossPath, nextContinuationToken);
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
}
