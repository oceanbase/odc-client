import { syncAll } from '@/common/network/database';
import { DBObjectSyncStatus, IDatabase } from '@/d.ts/database';
import { ReactComponent as SyncMetadataSvg } from '@/svgr/sync_metadata.svg';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/data/dateTime';
import { LoadingOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useEffect, useRef, useState, useContext } from 'react';

export default function Reload({
  size = '13px',
  databaseList,
  reload,
}: {
  size?: string;
  databaseList?: IDatabase[];
  reload?: () => void;
}) {
  const statusMap = {
    NOTSYNCED: {
      message: (e) =>
        formatMessage({
          id: 'src.component.Button.SyncMetadata.9F1736BB',
          defaultMessage: '元数据同步',
        }),
      icon: <SyncMetadataSvg onClick={_onClick} style={{ fontSize: size, cursor: 'pointer' }} />,
    },
    SYNCING: {
      message: (e) =>
        formatMessage({
          id: 'src.component.Button.SyncMetadata.30BFD3E6',
          defaultMessage: '元数据同步中，请等待',
        }),
      icon: (
        <LoadingOutlined
          style={{ fontSize: size, cursor: 'pointer', color: 'var(--brand-blue6-color)' }}
        />
      ),
    },
    SYNCED: {
      message: (time) =>
        formatMessage(
          {
            id: 'src.component.Button.SyncMetadata.FD352980',
            defaultMessage: '元数据同步（上一次同步时间：{time}）',
          },
          { time },
        ),
      icon: <SyncMetadataSvg onClick={_onClick} style={{ fontSize: size, cursor: 'pointer' }} />,
    },
  };

  const [lastSyncTime, setLastSyncTime] = useState();
  const [state, setState] = useState(statusMap.NOTSYNCED);
  const fetchDBTimer = useRef<number>();

  function updateState() {
    if (
      databaseList?.every((item) =>
        [DBObjectSyncStatus.SYNCED, DBObjectSyncStatus.FAILED].includes(item.objectSyncStatus),
      )
    ) {
      // 全部都是SYNCED或者FAILED, 就展示上次同步时间(取最小时间)
      setLastSyncTime(getlastSyncTime(databaseList)?.objectLastSyncTime);
      setState(statusMap.SYNCED);
    } else if (
      databaseList?.find((item) =>
        [DBObjectSyncStatus.SYNCING, DBObjectSyncStatus.PENDING].includes(item.objectSyncStatus),
      )
    ) {
      // 有状态为初始化同步中的, 就是 元数据同步中,请稍等
      setState(statusMap.SYNCING);
      fetchDBTimer.current = window.setTimeout(() => {
        reload();
      }, 30000);
    } else if (
      databaseList?.find((item) =>
        [DBObjectSyncStatus.INITIALIZED, null].includes(item.objectSyncStatus),
      )
    ) {
      // 只要有一个是INITIALIZED, null, 就还没整体初始化过, 展示初始态
      setState(statusMap.NOTSYNCED);
    }
  }
  useEffect(() => {
    if (databaseList) {
      updateState();
    }
    return () => {
      if (fetchDBTimer.current) {
        clearTimeout(fetchDBTimer.current);
        fetchDBTimer.current = null;
      }
    };
  }, [databaseList]);

  async function _onClick() {
    setState(statusMap.SYNCING);
    await syncAll();
    await reload();
  }

  const getlastSyncTime = (data) => {
    // @ts-ignore
    const compareDates = (a, b) => new Date(a.date) - new Date(b.date);
    const findEarliest = (data) =>
      data.reduce(
        (earliest, item) => (compareDates(earliest, item) < 0 ? earliest : item),
        Infinity,
      );
    return findEarliest(data);
  };

  return (
    <Tooltip
      placement="bottom"
      styles={{
        root: { maxWidth: 340 },
      }}
      title={state?.message(getLocalFormatDateTime(lastSyncTime))}
    >
      <span
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignContent: 'center',
        }}
      >
        {state?.icon}
      </span>
    </Tooltip>
  );
}
