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

import React from 'react';
import { setLocale } from '@umijs/max';
import utc from 'dayjs/plugin/utc';
import duration from 'dayjs/plugin/duration';
import dayjs from 'dayjs';
import { initMetaStore } from './common/metaStore';
import DndHTML5Provider from './component/DndHTML5Provider';
import registerPlugins from './plugins/register';
import { isClient } from './util/env';
import logger from './util/logger';
import { getRoute } from './util/tracert/userRoutes';
import { initIntl } from './util/intl';
import { initSentry } from './util/sentry';
import { ConfigProvider } from 'antd';
import { theme } from './layout/antdTheme';
dayjs.extend(utc);
dayjs.extend(duration);
if (isClient()) {
  import('@sentry/electron').then((_Sentry) => {
    _Sentry.init({
      dsn: 'https://859452cf23044aeda8677a8bdcc53081@obc-sentry.oceanbase.com/3',
    });
  });
} else {
  initSentry();
}

// TODO: 非云上场景不应该 export qiankun
export const qiankun = {
  // 应用加载之前
  async bootstrap() {
    // console.log('odc bootstrap');
  },
  // 应用 render 之前触发
  async mount(props: any) {
    logger.log(props);
    // @ts-ignore
    window._odc_params = props;
    // TODO：支持英文版
    if (props && props.locale) {
      logger.log('[setLocale] props.locale', props.locale);
      setLocale(props.locale, true);
    }
  },
  // 应用卸载之后触发
  async unmount() {
    // console.log('odc unmount');
    window._odc_params = null;
  },
};

export async function render(oldRender: () => void) {
  ConfigProvider.config({
    theme: theme,
  });
  await initIntl();
  registerPlugins();
  await initMetaStore();
  oldRender();
}

export function rootContainer(container) {
  return React.createElement(DndHTML5Provider, null, container);
}

export function onRouteChange(routes: any) {
  const tracert = window['Tracert'];
  if (!tracert) {
    return;
  }

  const routeInfo = getRoute(routes, tracert);
  if (routeInfo) {
    // 设置信息
    tracert.call('set', routeInfo);
    // 触发 PV
    tracert.call('logPv');
  }
}
