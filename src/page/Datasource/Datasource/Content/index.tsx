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

import PageContainer, { TitleType } from '@/component/PageContainer';
import { ModalStore } from '@/store/modal';
import { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { inject, observer } from 'mobx-react';
import { forwardRef, useContext, useImperativeHandle, useRef } from 'react';
import Header from '../Header';
import ParamContext from '../ParamContext';
import styles from './index.less';
import List from './List';
import TitleButton from './TitleButton';

interface IProps {
  modalStore?: ModalStore;
  settingStore?: SettingStore;
}

const Content = function (props: IProps, ref) {
  const listRef = useRef<any>();

  const reload = async () => {
    return await listRef.current?.reload();
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        reload,
      };
    },
    [],
  );
  return (
    <PageContainer
      titleProps={{
        title: formatMessage({ id: 'odc.Datasource.Content.DataSource', defaultMessage: '数据源' }), //数据源
        type: TitleType.TEXT,
        showDivider: true,
      }}
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <TitleButton onReload={reload} />
          <Header />
        </div>
        <div className={styles.list}>
          <List ref={listRef} />
        </div>
      </div>
    </PageContainer>
  );
};

export default inject('modalStore', 'settingStore')(observer(forwardRef<any, IProps>(Content)));
