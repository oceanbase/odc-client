import ipcInvoke from './service';

let port;
export async function initClientService() {
  port = await ipcInvoke('getMainServerPort');
  console.log('server port: ', port);
}
export function getClientServerPort() {
  return port || 0;
}

export async function haveLockPwd() {
  return await ipcInvoke('haveLock');
}

export async function isLock() {
  return !(await ipcInvoke('checkProcessKey', localStorage.getItem('lockKey')));
}

export async function changeLockPwd(originPwd: string, pwd: string) {
  return await ipcInvoke('changeLockPwd', originPwd, pwd);
}

/**
 * 选择一个文件夹
 */
export async function selectFolder(): Promise<string> {
  return await ipcInvoke('selectFolder');
}
