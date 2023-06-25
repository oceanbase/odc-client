import { SessionManagePage as SessionManagePageModel } from '@/store/helper/page/pages';
import SessionManage from './index';

interface IProps {
  params: SessionManagePageModel['pageParams'];
}

export default function SessionManagePage(props: IProps) {
  return <SessionManage showDatasource={true} defaultDatasouceId={props?.params?.cid} />;
}
