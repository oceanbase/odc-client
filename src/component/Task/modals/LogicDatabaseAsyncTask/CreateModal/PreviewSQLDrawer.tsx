import { formatMessage } from '@/util/intl';
import { previewSqls } from '@/common/network/logicalDatabase';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import MiniTable from '@/component/Table/MiniTable';
import { IDatabase } from '@/d.ts/database';
import { IPreviewSql } from '@/d.ts/logicalDatabase';
import { Drawer, Space, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import datasourceStatus from '@/store/datasourceStatus';

const PreviewSQLDrawer: React.FC<{
  open: boolean;
  sqlContent: string;
  delimiter: string;
  databaseId: number;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ open, setOpen, sqlContent, delimiter, databaseId }) => {
  const [previewList, setPreviewList] = useState<IPreviewSql[]>([]);
  useEffect(() => {
    if (open && sqlContent) {
      getPreviewData();
    }
  }, [open, sqlContent]);

  const getPreviewData = async () => {
    const params = {
      sql: sqlContent,
      delimiter: delimiter,
    };
    const res = await previewSqls(databaseId, params);
    setPreviewList(res);
    datasourceStatus.asyncUpdateStatus(res?.map((a) => a.database?.dataSource?.id));
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const columns = [
    {
      key: 'sql',
      title: formatMessage({
        id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.7909813D',
        defaultMessage: '实际 SQL',
      }),
      dataIndex: 'sql',
      width: 440,
      ellipsis: true,
      render(value) {
        return (
          <Tooltip
            overlayInnerStyle={{
              whiteSpace: 'pre-wrap',
              maxHeight: '500px',
              overflowY: 'auto',
            }}
            title={value}
          >
            <div
              style={{
                width: 430,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {value}
            </div>
          </Tooltip>
        );
      },
    },
    {
      key: 'database',
      title: formatMessage({
        id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.2570043F',
        defaultMessage: '执行数据库',
      }),
      dataIndex: 'database',
      filters: Array.from(new Set(previewList?.map((item) => item.database?.id)))?.map((i) => {
        return {
          text: previewList?.find((j) => j?.database?.id === i)?.database?.name,
          value: i,
        };
      }),
      onFilter: (value, record) => {
        return record?.database?.id === value;
      },
      render(value: IDatabase) {
        return (
          <Space>
            <DataBaseStatusIcon item={value} />
            {value?.name}
          </Space>
        );
      },
    },
  ];

  return (
    <Drawer
      title={formatMessage({
        id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.8C0ECF89',
        defaultMessage: '预览实际 SQL',
      })}
      width={720}
      open={open}
      onClose={handleCancel}
      closable
      destroyOnClose
    >
      <MiniTable<any>
        rowKey={'id'}
        columns={columns}
        dataSource={previewList}
        pagination={null}
        loadData={() => {}}
      />
    </Drawer>
  );
};

export default PreviewSQLDrawer;
