import { RecycleBinPage as RecycleBinPageModel } from '@/store/helper/page/pages';
import RecycleBin from './index';

interface IProps {
  params: RecycleBinPageModel['pageParams'];
}

export default function RecycleBinPage(props: IProps) {
  return <RecycleBin showDatasource={true} datasourceId={props?.params?.cid} />;
}
