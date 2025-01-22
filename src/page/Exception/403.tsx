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

import { formatMessage } from '@/util/intl';
import { getLocale } from '@umijs/max';

import Exception from '@/component/Exception/index';
import login from '@/store/login';
import { Button } from 'antd';

export default () => {
  console.log('[getLocale()]', getLocale());
  console.log('403');
  async function back() {
    await login.logout();
    login.gotoLogoutPage();
  }
  return (
    <Exception
      type="403"
      desc=""
      actions={
        <Button type="primary" onClick={back}>
          {
            formatMessage({
              id: 'odc.page.Exception.403.LogOnAgain',
              defaultMessage: '重新登录',
            }) /*重新登录*/
          }
        </Button>
      }
    />
  );
};
