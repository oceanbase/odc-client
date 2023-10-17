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

import { formatMessage } from '@/util/intl';
import { getAllConnectTypes } from '@/common/datasource';
import { ConnectTypeText } from '@/constant/label';
import { IDataSourceType } from '@/d.ts/datasource';
import { Dropdown } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useMemo } from 'react';
interface IProps {}
export default function AddDataSourceDropdown(props: IProps) {
  const mysqlConnectTypes = getAllConnectTypes(IDataSourceType.MySQL);
  const obConnectTypes = getAllConnectTypes(IDataSourceType.OceanBase);
  const result: ItemType[] = useMemo(() => {
    const result = [];
    obConnectTypes.forEach((t) => {
      result.push({
        label: ConnectTypeText[t],
        key: t,
      });
    });
    result.push({
      type: 'divider',
    });
    mysqlConnectTypes.forEach((t) => {
      result.push({
        label: ConnectTypeText[t],
        key: t,
      });
    });
    result.push({
      label: formatMessage({
        id: 'odc.src.component.AddDataSourceDropdown.BatchImport',
      }), //'批量导入'
      key: 'batchImport',
    });
    return result;
  }, [mysqlConnectTypes, obConnectTypes]);
  return (
    <Dropdown
      menu={{
        items: result,
      }}
    ></Dropdown>
  );
}
