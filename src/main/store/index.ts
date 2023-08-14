/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
