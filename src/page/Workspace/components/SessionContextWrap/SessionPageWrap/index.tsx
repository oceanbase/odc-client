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
  readonly?: boolean;
  useMaster?: boolean;
  supportLocation?: boolean;
}

export function SessionPage({
  children,
  databaseId,
  readonly,
  useMaster,
  supportLocation,
}: IProps) {
  return (
    <SessionContextWrap useMaster={useMaster} defaultDatabaseId={databaseId}>
      {({ session }) => {
        return (
          <div className={styles.sessionWrap}>
            <SessionSelect readonly={readonly} supportLocation={supportLocation} />
            <div key={session?.sessionId} className={styles.content}>
              {!session ? <WorkSpacePageLoading /> : children}
            </div>
          </div>
        );
      }}
    </SessionContextWrap>
  );
}

export default function WrapSessionPage(
  Component,
  readonly?: boolean,
  useMaster?: boolean,
  supportLocation?: boolean,
) {
  return function WrapComponent(props) {
    return (
      <SessionPage
        databaseId={props?.params?.databaseId}
        readonly={readonly}
        useMaster={useMaster}
        supportLocation={supportLocation}
      >
        <Component {...props} />
      </SessionPage>
    );
  };
}
