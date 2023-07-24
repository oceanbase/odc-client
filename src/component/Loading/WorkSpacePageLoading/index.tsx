import { formatMessage } from '@/util/intl';
import { Spin } from 'antd';

export default function WorkSpacePageLoading() {
  return (
    <Spin
      style={{ marginLeft: '50%', transform: 'translateX(-50%)', marginTop: 100 }}
      tip={formatMessage({ id: 'odc.Loading.WorkSpacePageLoading.Connecting' })} /*连接中...*/
    ></Spin>
  );
}
