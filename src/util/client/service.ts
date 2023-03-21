export default async function ipcInvoke(method, ...args) {
  return require('electron')
    .ipcRenderer.invoke(method, ...args)
    .then((result) => {
      return result;
    });
}
