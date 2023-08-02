export const defaultMainWebWidth = 1250;

export const defaultMainWebHeight = 760;

export const minJDKVersion = '1.8.0';

export const maxJDKVersion = '1.8.0';

export const minJDKReleaseVersion = 200;

export const mainWebWindowConfig = {
  height: defaultMainWebHeight,
  width: defaultMainWebWidth,
  center: true,
  show: false,
  webPreferences: {
    nodeIntegration: true,
    nodeIntegrationInWorker: false,
    enableRemoteModule: true,
    contextIsolation: false,
    plugins: true,
  },
};
