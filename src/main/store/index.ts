import url from 'url';
import MainServer from '../server/main';
import log from '../utils/log';

export class PathnameStore {
  public static PROTOCOL = 'http';
  private static defaultPathname: string = 'index.html';
  private static hostname: string = 'localhost';
  public static pathname: string = PathnameStore.defaultPathname;
  public static hash: string = '';

  public static getUrl = () => {
    const href = url.format({
      pathname: PathnameStore.pathname,
      hash: PathnameStore.hash,
      protocol: PathnameStore.PROTOCOL,
      slashes: true,
      hostname: PathnameStore.hostname,
      port:
        process.env.NODE_ENV === 'development' ? '8000' : MainServer.getInstance().port.toString(),
    });
    log.info('renderer url: ', href);
    return href;
  };
  public static setPathname = (pathname: string) => {
    PathnameStore.pathname = pathname;
  };
  public static reset = () => {
    PathnameStore.pathname = PathnameStore.defaultPathname;
    PathnameStore.hash = '';
  };
  public static addParams = (params: string) => {
    PathnameStore.hash = '#/gateway/' + params;
  };
}
