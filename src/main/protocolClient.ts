import { app } from 'electron';

import packageJson from '../../package.json';

/**
 * 注册schema打开协议
 */
export function registerProtocolClient() {
  //@ts-ignore
  const schema = packageJson.build?.protocols?.schemes?.[0];
  if (schema) {
    if (app.isDefaultProtocolClient(schema)) {
      return;
    }
    app.setAsDefaultProtocolClient(schema);
  }
}
