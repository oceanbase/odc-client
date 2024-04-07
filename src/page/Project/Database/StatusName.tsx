import HelpDoc from '@/component/helpDoc';
import { IConnectionStatus } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import datasourceStatus from '@/store/datasourceStatus';
import { Button } from 'antd';
import { observer } from 'mobx-react';

export default observer(function StatusName({
  item,
  onClick,
}: {
  item: IDatabase;
  onClick: () => void;
}) {
  const statusMap = datasourceStatus.statusMap;
  const status = statusMap.get(item.dataSource?.id) || item.dataSource?.status;
  let content;
  switch (status.status) {
    case IConnectionStatus.TESTING: {
      return (
        <Button type="link" loading>
          {item?.name}
        </Button>
      );
    }
    case IConnectionStatus.ACTIVE: {
      return <a onClick={onClick}>{item?.name}</a>;
    }
    default: {
      const errorMsg = status.errorMessage || 'datasource disconnected';
      return (
        <HelpDoc isTip={false} title={errorMsg}>
          {item?.name}
        </HelpDoc>
      );
    }
  }
});
