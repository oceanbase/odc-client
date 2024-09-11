import MiniTable from '@/component/Table/MiniTable';
import { Drawer, Space } from 'antd';
import { useEffect, useState } from 'react';
import { previewSqls } from '@/common/network/logicalDatabase';
import { IPreviewSql } from '@/d.ts/logicalDatabase';
import { IDatabase } from '@/d.ts/database';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';

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
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const columns = [
    {
      key: 'sql',
      title: '实际 SQL',
      dataIndex: 'sql',
      width: 440,
      ellipsis: true,
      render(value) {
        return <span title={value}>{value}</span>;
      },
    },
    {
      key: 'database',
      title: '执行数据库',
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
      title="预览实际 SQL"
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
