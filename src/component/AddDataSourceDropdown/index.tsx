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
      label: '批量导入',
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
