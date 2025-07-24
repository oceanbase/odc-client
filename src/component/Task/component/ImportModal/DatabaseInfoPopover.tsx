import { IImportDatabaseView } from '@/d.ts/importTask';
import { formatMessage } from '@/util/intl';
import Icon, { InfoCircleOutlined } from '@ant-design/icons';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { getCloudProviderName } from '../AsyncTaskOperationButton/helper';
import { fromODCPRoviderToProvider } from '@/d.ts/migrateTask';
import { ConnectTypeText } from '@/constant/label';
import {
  Tooltip,
  Popover,
  Table,
  Descriptions,
  Typography,
  Empty,
  Radio,
  Space,
  Checkbox,
  Flex,
  Tag,
} from 'antd';

const DatabaseInfoPopover = ({
  title,
  value,
  popoverWidth,
  children,
}: {
  title: string;
  value: IImportDatabaseView;
  popoverWidth: number;
  children: React.JSX.Element;
}) => {
  const items = [
    {
      key: 'datasource',
      label: formatMessage({
        id: 'src.component.Task.component.ImportModal.A8BC98CA',
        defaultMessage: '数据源',
      }),
      children: value?.name,
    },
    {
      key: 'databaseName',
      label: formatMessage({
        id: 'src.component.Task.component.ImportModal.0B1F9DCD',
        defaultMessage: '数据库',
      }),
      children: value?.databaseName,
    },
    {
      key: 'type',
      label: formatMessage({
        id: 'src.component.Task.component.ImportModal.263EFA83',
        defaultMessage: '类型',
      }),
      children: (
        <div style={{ display: 'flex', gap: 6 }}>
          <Icon
            style={{
              color: getDataSourceStyleByConnectType(value?.type)?.icon?.color,
              fontSize: 16,
            }}
            component={getDataSourceStyleByConnectType(value?.type)?.icon?.component}
          />

          {ConnectTypeText(value?.type)}
        </div>
      ),
    },
    {
      key: 'host',
      label: '主机 IP/域名：',
      children: <Tooltip title={`${value?.host}`}>{value?.host}</Tooltip>,
    },
    {
      key: 'host',
      label: '端口',
      children: <Tooltip title={`${value?.port}`}>{value?.port}</Tooltip>,
    },
    {
      key: 'username',
      label: formatMessage({
        id: 'src.component.Task.component.ImportModal.5928CAE8',
        defaultMessage: '数据库账号',
      }),
      children: value?.username || '-',
    },
  ];

  return (
    <Popover
      title={''}
      content={
        value ? (
          <>
            <h3>{title}</h3>
            <Descriptions column={1} style={{ width: popoverWidth }} size="small">
              {items?.map((i) => {
                return (
                  <Descriptions.Item key={i?.key} label={i?.label}>
                    {i?.children}
                  </Descriptions.Item>
                );
              })}
            </Descriptions>
          </>
        ) : null
      }
      arrow={false}
    >
      <div>{children}</div>
    </Popover>
  );
};

export default DatabaseInfoPopover;
