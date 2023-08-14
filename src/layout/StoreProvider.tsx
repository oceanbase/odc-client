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

import { Provider } from 'mobx-react';

import authStore from '@/store/auth';
import clusterStore from '@/store/cluster';
import commonStore from '@/store/common';
import debugStore from '@/store/debug';
import userStore from '@/store/login';
import modalStore from '@/store/modal';
import pageStore from '@/store/page';
import sessionManagerStore from '@/store/sessionManager';
import settingStore from '@/store/setting';
import snippetStore from '@/store/snippet';
import sqlStore from '@/store/sql';
import taskStore from '@/store/task';

export default function (props) {
  return (
    <Provider
      settingStore={settingStore}
      pageStore={pageStore}
      sqlStore={sqlStore}
      userStore={userStore}
      commonStore={commonStore}
      modalStore={modalStore}
      taskStore={taskStore}
      snippetStore={snippetStore}
      authStore={authStore}
      debugStore={debugStore}
      clusterStore={clusterStore}
      sessionManagerStore={sessionManagerStore}
    >
      {props.children}
    </Provider>
  );
}
