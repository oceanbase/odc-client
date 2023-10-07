import React, { useContext, useEffect, useRef, useState } from 'react';
import SideTabs, { ITab } from '../../components/SideTabs';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import { formatMessage } from '@/util/intl';
import DataSourceTree from './Datasource';
import ProjectTree from './Project';
import { inject, observer } from 'mobx-react';
import Icon, { CloseOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { UserStore } from '@/store/login';
import NewDatasourceDrawer from '@/page/Datasource/Datasource/NewDatasourceDrawer';
import { Space } from 'antd';
import styles from './index.less';
import classNames from 'classnames';

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
  const [addVisible, setAddVisible] = useState(false);
  const [selectPanel, setSelectPanel] = useState<PanelType>(PanelType.DataSource);
  const sourceRef = useRef<any>();
  const projectRef = useRef<any>();
  const isPersonal = userStore?.isPrivateSpace();

  const datasource: ITab = {
    title: formatMessage({ id: 'odc.SideBar.ResourceTree.Container.DataSource' }), //数据源
    key: PanelType.DataSource,
    render() {
      return <DataSourceTree ref={sourceRef} />;
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
    key: PanelType.Project,
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
        selectTabKey={selectPanel}
        setSelectTabKey={(v) => {
          setSelectPanel(v as PanelType);
        }}
        tabs={isPersonal ? [datasource] : [datasource, project]}
        leftAction={
          <Icon
            disabled={!isSelected}
            component={CloseOutlined}
            className={classNames(styles.closeBtn, { [styles.closeBtnDisable]: !isSelected })}
            onClick={!isSelected ? null : () => onClose()}
          />
        }
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
};

export default inject('userStore')(observer(SelectPanel));
