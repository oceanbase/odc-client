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

import Reload from '@/component/Button/Reload';
import { ConnectType } from '@/d.ts';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import { UserStore } from '@/store/login';
import { formatMessage } from '@/util/intl';
import Icon, { CloseOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import SideTabs, { ITab } from '../../components/SideTabs';
import DatasourceFilter from '../DatasourceFilter';
import DataSourceTree from './Datasource';
import styles from './index.less';
import ProjectTree from './Project';
interface IProps {
  userStore?: UserStore;
  onClose: () => void;
}
enum PanelType {
  DataSource = 'datasource',
  Project = 'project',
}
const SelectPanel: React.FC<IProps> = function ({ userStore, onClose }) {
  const resourcetreeContext = useContext(ResourceTreeContext);
  const { selectProjectId, selectDatasourceId } = resourcetreeContext;
  const [selectPanel, setSelectPanel] = useState<PanelType>(PanelType.DataSource);
  const [envs, setEnvs] = useState<number[]>([]);
  const [connectTypes, setConnectTypes] = useState<ConnectType[]>([]);
  const sourceRef = useRef<any>();
  const projectRef = useRef<any>();
  const isPersonal = userStore?.isPrivateSpace();
  const datasource: ITab = {
    title: formatMessage({
      id: 'odc.SideBar.ResourceTree.Container.DataSource',
    }),
    //数据源
    key: PanelType.DataSource,
    render() {
      return (
        <DataSourceTree
          closeSelectPanel={onClose}
          filters={{
            envs,
            connectTypes,
          }}
          ref={sourceRef}
        />
      );
    },
    groupSize: 3,
    actions: [
      {
        render() {
          return (
            <DatasourceFilter
              key="SelectPanelDatasourceFilter"
              iconStyle={{
                verticalAlign: 'text-top',
              }}
              onClear={() => {
                setEnvs([]);
                setConnectTypes([]);
              }}
              onEnvsChange={(v) => setEnvs(v)}
              onTypesChange={(v) => setConnectTypes(v)}
              envs={envs}
              types={connectTypes}
            />
          );
        },
      },
      {
        render() {
          return (
            <Reload
              key="DataSourceReload"
              onClick={async () => {
                return await sourceRef.current?.reload?.();
              }}
            />
          );
        },
      },
    ].filter(Boolean),
  };
  const project: ITab = {
    title: formatMessage({
      id: 'odc.SideBar.ResourceTree.Container.Project',
    }),
    //项目
    key: PanelType.Project,
    render() {
      return <ProjectTree closeSelectPanel={onClose} ref={projectRef} />;
    },
    actions: [
      {
        render() {
          return (
            <Reload
              key="ProjectReload"
              onClick={async () => {
                return await projectRef.current?.reload?.();
              }}
            />
          );
        },
      },
    ],
  };
  useEffect(() => {
    if (selectProjectId) {
      setSelectPanel(PanelType.Project);
    } else {
      setSelectPanel(PanelType.DataSource);
    }
  }, [selectDatasourceId, selectProjectId]);
  const isSelected = selectDatasourceId || selectProjectId;
  return (
    <>
      <SideTabs
        key="SelectPanelSideTabs"
        selectTabKey={selectPanel}
        setSelectTabKey={(v) => {
          setSelectPanel(v as PanelType);
        }}
        tabs={isPersonal ? [datasource] : [datasource, project]}
        leftAction={
          !isSelected ? null : (
            <Icon
              component={CloseOutlined}
              className={classNames(styles.closeBtn, {
                [styles.closeBtnDisable]: !isSelected,
              })}
              onClick={!isSelected ? null : () => onClose()}
            />
          )
        }
      />
    </>
  );
};
export default inject('userStore')(observer(SelectPanel));
