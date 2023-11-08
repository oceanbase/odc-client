const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("ODCClient", {
    ipcInvoke(method, ...args) {
        return ipcRenderer.invoke(method, ...args)
          .then((result) => {
            return result;
          });
      }
})