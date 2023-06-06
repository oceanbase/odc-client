import { ReloadOutlined } from '@ant-design/icons';
import SideTabs, { ITab } from '../components/SideTabs';
import DatasourceTree from './Datasource';
import ProjectTree from './Project';

export default function ResourceTreeContainer() {
  const datasource: ITab = {
    title: '数据源',
    key: 'datasource',
    render() {
      return <DatasourceTree />;
    },
    actions: [
      {
        icon: ReloadOutlined,
        key: 'reload',
        title: '刷新',
        onClick() {},
      },
    ],
  };
  const project: ITab = {
    title: '项目',
    key: 'project',
    render() {
      return <ProjectTree />;
    },
    actions: [
      {
        icon: ReloadOutlined,
        key: 'reload',
        title: '刷新',
        onClick() {},
      },
    ],
  };
  return <SideTabs tabs={[datasource, project]} />;
}
