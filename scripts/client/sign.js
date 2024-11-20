const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const AdmZip = require('adm-zip');
const temp = path.resolve(process.cwd(), 'temp');
const source = path.resolve(process.cwd(), 'libraries/java');

if (!fs.existsSync(temp)) {
    fs.mkdirSync(temp);
} else {
    console.log('clean temp')
    fs.rmSync(temp, { recursive: true});
    fs.mkdirSync(temp);
    console.log('clean temp done')
}
function getUniqKey() {
    return new Date().getTime() + '_' + Math.random().toString(36).substring(2, 6);
}
console.log(
    execSync('java -version', {
        stdio: 'inherit'
    })?.toString()
)
function walkSync(currentDirPath) {
    const files = [];
    fs.readdirSync(currentDirPath, { withFileTypes: true }).forEach(function (dirent) {
        var filePath = path.join(currentDirPath, dirent.name);
        if (dirent.isFile()) {
            files.push(filePath);
        } else if (dirent.isDirectory()) {
            const subFiles = walkSync(filePath);
            files.push(...subFiles);
        }
    });
    return files;
}
async function codesign(src) {
    const cert = 'Developer ID Application: Beijing OceanBase Technology Co., Ltd. (QWQ3HBA8MF)'
    const cmd = `codesign --force --timestamp --options runtime --entitlements ./node_modules/electron-builder-notarize/entitlements.mac.inherit.plist  --sign "${cert}" ${src}`;
    try {
        console.log(
            execSync(cmd)?.toString()
        )
    } catch (e) {
        console.log('error: ', e)
        console.log('retry:', src)
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(true)
            }, 10000);
        })
        console.log(
            execSync(cmd)?.toString()
        )
    }
}

async function signAllFiles(srcPath) {
    const files = walkSync(srcPath);
    const zipOrJarFiles = [];
    const binaryFiles = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.endsWith('.jnilib') || file.endsWith('.dylib') || file.endsWith('.so')) {
            binaryFiles.push(file);
        } else if (file.endsWith('.jar') || file.endsWith('.zip')) {
            zipOrJarFiles.push(file);
        }
    }
    for (let i = 0; i < zipOrJarFiles.length; i++) {
        const file = zipOrJarFiles[i];
        const zip = new AdmZip(file);
        console.log('find Zip: ', file)
        const tempDir = path.resolve(temp, getUniqKey());
        zip.extractAllTo(tempDir, true);
        await signAllFiles(tempDir);
        console.log('overwrite zip: ', file)
        fs.rmSync(file);
        if (file.endsWith('.jar')) {
            execSync(`jar   -cMf0 ${file}   -C ${tempDir} .`, {
                env: {
                    ...process.env,
                    JAVA_HOME: "`/usr/libexec/java_home -v 1.8.0_202`"
                }
            })
        } else {

            const zip2 = new AdmZip();
            zip2.addLocalFolder(tempDir);
            zip2.writeZip(file);
        }
        fs.rmSync(tempDir, { recursive: true});
        console.log('overwrite zip done');
    }

    for (let i = 0; i < binaryFiles.length; i++) {
        const file = binaryFiles[i];
        console.log('find binary: ', file)
        await codesign(file);
        console.log('codesign done');
    }
}

exports.run = async function run () {
    return await signAllFiles(source)
}
