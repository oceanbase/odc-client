import SessionManage from '@/page/Workspace/components/SessionManagementPage';
import { Input } from 'antd';

const { Search } = Input;

interface IProps {
  dataSourceId: number;
}

export default function SessionManager({ dataSourceId }: IProps) {
  return <SessionManage simpleHeader defaultDatasouceId={dataSourceId} />;
}
