import { SpaceType } from '@/d.ts/_index';
import NewDatasourceDrawer from '@/page/Datasource/Datasource/NewDatasourceDrawer';
import { UserStore } from '@/store/login';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import { useContext, useRef, useState } from 'react';
import ResourceTreeContext, { ResourceTreeTab } from '../../context/ResourceTreeContext';
import SideTabs, { ITab } from '../components/SideTabs';
import DatasourceTree from './Datasource';
import ProjectTree from './Project';

export default inject('userStore')(
  observer(function ResourceTreeContainer({ userStore }: { userStore: UserStore }) {
    const sourceRef = useRef<any>();
    const projectRef = useRef<any>();
    const [addVisible, setAddVisible] = useState(false);
    const resourcetreeContext = useContext(ResourceTreeContext);
    const isPersonal =
      userStore?.organizations?.find((i) => i.id === userStore?.organizationId)?.type ===
      SpaceType.PRIVATE;
    const datasource: ITab = {
      title: '数据源',
      key: ResourceTreeTab.datasource,
      render() {
        return <DatasourceTree ref={sourceRef} />;
      },
      actions: [
        isPersonal
          ? {
              icon: PlusOutlined,
              key: 'add',
              title: '添加数据源',
              async onClick() {
                return setAddVisible(true);
              },
            }
          : null,
        {
          icon: ReloadOutlined,
          key: 'reload',
          title: '刷新',
          async onClick() {
            return await sourceRef.current?.reload?.();
          },
        },
      ].filter(Boolean),
    };
    const project: ITab = {
      title: '项目',
      key: ResourceTreeTab.project,
      render() {
        return <ProjectTree ref={projectRef} />;
      },
      actions: [
        {
          icon: ReloadOutlined,
          key: 'reload',
          title: '刷新',
          async onClick() {
            return await projectRef.current?.reload?.();
          },
        },
      ],
    };
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
