import { ReloadOutlined } from '@ant-design/icons';
import { useRef } from 'react';
import SideTabs, { ITab } from '../components/SideTabs';
import DatasourceTree from './Datasource';
import ProjectTree from './Project';

export default function ResourceTreeContainer() {
  const sourceRef = useRef<any>();
  const projectRef = useRef<any>();

  const datasource: ITab = {
    title: '数据源',
    key: 'datasource',
    render() {
      return <DatasourceTree ref={sourceRef} />;
    },
    actions: [
      {
        icon: ReloadOutlined,
        key: 'reload',
        title: '刷新',
        async onClick() {
          return await sourceRef.current?.reload?.();
        },
      },
    ],
  };
  const project: ITab = {
    title: '项目',
    key: 'project',
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
  return <SideTabs tabs={[datasource, project]} />;
}
