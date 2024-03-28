/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
