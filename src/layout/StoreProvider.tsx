import { Provider } from 'mobx-react';

import authStore from '@/store/auth';
import clusterStore from '@/store/cluster';
import commonStore from '@/store/common';
import connectionStore from '@/store/connection';
import debugStore from '@/store/debug';
import userStore from '@/store/login';
import modalStore from '@/store/modal';
import pageStore from '@/store/page';
import schemaStore from '@/store/schema';
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
      connectionStore={connectionStore}
      userStore={userStore}
      schemaStore={schemaStore}
      commonStore={commonStore}
      modalStore={modalStore}
      taskStore={taskStore}
      snippetStore={snippetStore}
      authStore={authStore}
      debugStore={debugStore}
      clusterStore={clusterStore}
    >
      {props.children}
    </Provider>
  );
}
