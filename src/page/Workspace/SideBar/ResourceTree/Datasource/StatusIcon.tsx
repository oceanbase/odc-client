import { IConnection, IConnectionStatus } from '@/d.ts';
import { Tooltip } from 'antd';
import OBSvg from '@/svgr/source_ob.svg';
import Icon, { Loading3QuartersOutlined, MinusCircleFilled } from '@ant-design/icons';
import { formatMessage } from '@/util/intl';

import styles from './index.less';

export default function StatusIcon({ item }: { item: IConnection }) {
  switch (item?.status?.status) {
    case IConnectionStatus.TESTING: {
      return (
        <Tooltip
          placement="top"
          title={formatMessage({
            id: 'odc.components.ConnectionCardList.StatusSynchronizationInProgress',
          })}
        >
          <Loading3QuartersOutlined
            spin
            style={{
              color: '#1890FF',
            }}
          />
        </Tooltip>
      );
    }
    case IConnectionStatus.ACTIVE: {
      return (
        <Tooltip
          placement="top"
          title={formatMessage({
            id: 'odc.components.ConnectionCardList.ValidConnection',
          })}
        >
          <Icon component={OBSvg} style={{ fontSize: 16 }} className={styles.activeStatus} />
        </Tooltip>
      );
    }
    case IConnectionStatus.NOPASSWORD: {
      return (
        <Tooltip
          placement="top"
          title={
            formatMessage({
              id: 'odc.components.ConnectionCardList.TheConnectionPasswordIsNot',
            })

            // 连接密码未保存，无法获取状态
          }
        >
          <MinusCircleFilled />
        </Tooltip>
      );
    }
    case IConnectionStatus.DISABLED: {
      return (
        <Tooltip
          placement="top"
          title={formatMessage({
            id: 'odc.page.ConnectionList.columns.TheConnectionIsDisabled',
          })}

          /* 连接已停用 */
        >
          <MinusCircleFilled />
        </Tooltip>
      );
    }
    case IConnectionStatus.INACTIVE:
    default: {
      return (
        <Tooltip title={item?.status?.errorMessage} placement="top">
          <Icon
            component={OBSvg}
            style={{ filter: 'grayscale(1)', fontSize: 16 }}
            className={styles.activeStatus}
          />
        </Tooltip>
      );
    }
  }
}
