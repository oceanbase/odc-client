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

