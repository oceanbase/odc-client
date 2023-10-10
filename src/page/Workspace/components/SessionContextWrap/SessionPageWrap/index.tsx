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

import { PropsWithChildren } from 'react';
import SessionContextWrap from '..';
import SessionSelect from '../SessionSelect';

import WorkSpacePageLoading from '@/component/Loading/WorkSpacePageLoading';
import styles from './index.less';

interface IProps extends PropsWithChildren<any> {
  databaseId: number;
  databaseFrom: 'project' | 'datasource';
  readonly?: boolean;
  useMaster?: boolean;
}

export function SessionPage({ children, databaseId, databaseFrom, readonly, useMaster }: IProps) {
  return (
    <SessionContextWrap
      useMaster={useMaster}
      defaultDatabaseId={databaseId}
      defaultMode={databaseFrom || 'datasource'}
    >
      {({ session }) => {
        return (
          <div className={styles.sessionWrap}>
            <SessionSelect readonly={readonly} />
            <div key={session?.sessionId} className={styles.content}>
              {!session ? <WorkSpacePageLoading /> : children}
            </div>
          </div>
        );
      }}
    </SessionContextWrap>
  );
}

export default function WrapSessionPage(Component, readonly?: boolean, useMaster?: boolean) {
  return function WrapComponent(props) {
    return (
      <SessionPage
        databaseFrom={props?.params?.databaseFrom}
        databaseId={props?.params?.databaseId}
        readonly={readonly}
        useMaster={useMaster}
      >
        <Component {...props} />
      </SessionPage>
    );
  };
}
