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

import NewDatasourceDrawer from '@/page/Datasource/Datasource/NewDatasourceDrawer';
import { UserStore } from '@/store/login';
import { formatMessage } from '@/util/intl';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import { useContext, useEffect, useRef, useState } from 'react';
import ResourceTreeContext, { ResourceTreeTab } from '../../context/ResourceTreeContext';
import SideTabs, { ITab } from '../components/SideTabs';
import DatasourceTree from './Datasource';
import ProjectTree from './Project';
import tracert from '@/util/tracert';

export default inject('userStore')(
  observer(function ResourceTreeContainer({ userStore }: { userStore: UserStore }) {
    const sourceRef = useRef<any>();
    const projectRef = useRef<any>();
    const [addVisible, setAddVisible] = useState(false);
    const resourcetreeContext = useContext(ResourceTreeContext);
    const isPersonal = userStore?.isPrivateSpace();
    const datasource: ITab = {
      title: formatMessage({ id: 'odc.SideBar.ResourceTree.Container.DataSource' }), //数据源
      key: ResourceTreeTab.datasource,
      render() {
        return <DatasourceTree ref={sourceRef} />;
      },
      actions: [
        isPersonal
          ? {
              icon: PlusOutlined,
              key: 'add',
              title: formatMessage({ id: 'odc.SideBar.ResourceTree.Container.AddADataSource' }), //添加数据源
              async onClick() {
                return setAddVisible(true);
              },
            }
          : null,
        {
          icon: ReloadOutlined,
          key: 'reload',
          title: formatMessage({ id: 'odc.SideBar.ResourceTree.Container.Refresh' }), //刷新
          async onClick() {
            return await sourceRef.current?.reload?.();
          },
        },
      ].filter(Boolean),
    };
    const project: ITab = {
      title: formatMessage({ id: 'odc.SideBar.ResourceTree.Container.Project' }), //项目
      key: ResourceTreeTab.project,
      render() {
        return <ProjectTree ref={projectRef} />;
      },
      actions: [
        {
          icon: ReloadOutlined,
          key: 'reload',
          title: formatMessage({ id: 'odc.SideBar.ResourceTree.Container.Refresh' }), //刷新
          async onClick() {
            return await projectRef.current?.reload?.();
          },
        },
      ],
    };
    useEffect(() => {
      tracert.expo('a3112.b41896.c330988');
    }, []);
    return (
      <>
        <SideTabs
          selectTabKey={resourcetreeContext.selectTabKey}
          setSelectTabKey={resourcetreeContext?.setSelectTabKey}
          tabs={isPersonal ? [datasource] : [datasource, project]}
        />

        <NewDatasourceDrawer
          isPersonal={true}
          visible={addVisible}
          close={() => setAddVisible(false)}
          onSuccess={() => {
            sourceRef.current?.reload?.();
          }}
        />
      </>
    );
  }),
);
