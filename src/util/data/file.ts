export function generateAndDownloadFile(fileName: string, content: string) {
  let aDom = document.createElement('a');
  let fileBlob = new Blob([content]);
  let event = document.createEvent('MouseEvents');
  event.initMouseEvent(
    'click',
    true,
    false,
    document.defaultView,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,
  );
  aDom.download = fileName;
  aDom.href = URL.createObjectURL(fileBlob);
  aDom.dispatchEvent(event);
}

export function downloadFile(downloadUrl: string) {
  /**
   * 防止触发beforeunload提示
   */
  window._forceRefresh = true;
  const aDom = document.createElement('a');
  aDom.setAttribute('download', '');
  aDom.setAttribute('href', downloadUrl);
  document.body.appendChild(aDom);
  aDom.click();
  setTimeout(() => {
    document.body.removeChild(aDom);
    window._forceRefresh = false;
  });
}
