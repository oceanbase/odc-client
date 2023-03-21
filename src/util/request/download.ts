import { isClient } from '../env';

/**
 * 下载文件
 */
export default async function (response: Response, originalHref: string) {
  try {
    const a = document.createElement('a');
    // web 版前端触发下载
    if (!isClient()) {
      const blob = await response.clone().blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const header = response.headers.get('content-disposition');
      if (header) {
        // 尝试从响应头中提取
        // @see https://stackoverflow.com/questions/23054475/javascript-regex-for-extracting-filename-from-content-disposition-header/23054920
        const matches = header.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (matches && matches[1]) {
          a.download = matches[1];
          a.href = blobUrl;
          a.click();
        }
      }
    } else {
      // 客户端前端生成文件名，扩展名丢失
      const fileName = `tmp_${+new Date()}`;
      a.download = fileName;
      // @ts-ignore
      a.href = `${originalHref}&fileName=${fileName}`;
      a.click();
    }
  } catch (e) {
    console.error('download fail:', e);
  }
}
