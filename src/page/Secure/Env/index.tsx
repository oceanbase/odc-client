import { Button, Drawer, Select, Space, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import styles from './index.less';
interface DataType {
  key: string;
  envName: string;
  description: string;
  tag: {
    tabContent: string;
    tabStyle: string;
  };
}

const action: React.FC<{
  text: any;
  record: DataType;
  index: number;
  onClick: () => void;
}> = ({ onClick }) => {
  return (
    <Space size="middle">
      <a onClick={onClick}>设置审批流程</a>
    </Space>
  );
};

const env = () => {
  const tableRef = useRef<any>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const onClose = () => {
    setVisible(false);
  };

  const handleOpen = () => {
    setVisible(true);
  };

  const columns: ColumnsType<DataType> = [
    {
      title: '环境名称',
      dataIndex: 'envName',
      key: 'envName',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '标签样式',
      dataIndex: 'tagStyle',
      key: 'tagStyle',
      render: (_, { tag: { tabContent = '', tabStyle = '' } }) => {
        return <div className={tabStyle}>{tabContent}</div>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={handleOpen}>设置审批流程</a>
        </Space>
      ),
    },
  ];

  const data: DataType[] = [
    {
      key: '1',
      envName: '测试',
      description: '自动审批',
      tag: {
        tabContent: '开发',
        tabStyle: classNames(styles.tab, styles.dev),
      },
    },
    {
      key: '2',
      envName: '开发',
      description: '所有变更仅需 DBA 审批',
      tag: {
        tabContent: '测试',
        tabStyle: classNames(styles.tab, styles.test),
      },
    },
    {
      key: '3',
      envName: '生产',
      description: '所有变更需管理员和 DBA 审批',
      tag: {
        tabContent: '生产',
        tabStyle: classNames(styles.tab, styles.prod),
      },
    },
  ];
  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        className={classNames(styles.tableSpin, styles.smallTable, {
          // [styles.scrollAble]: !!scrollHeight,
        })}
        // rowClassName={(record, i) =>
        // `${tableProps?.rowClassName} ${i % 2 === 0 ? styles.even : styles.odd}`
        // }
      />
      <SetApprovalDrawer visible={visible} onClose={onClose} />
    </>
  );
};
interface ApprovalDrawerProps {
  visible: boolean;
  onClose: () => void;
}
interface SubDataType {
  workOrderType: string;
  approvalProcess: string;
}
const SetApprovalDrawer: React.FC<ApprovalDrawerProps> = ({ visible, onClose }) => {
  const onSubmit = () => {
    onClose();
  };
  const cancel = () => {
    onClose();
  };
  const columns: ColumnsType<SubDataType> = [
    {
      title: '工单类型',
      width: 120,
      dataIndex: 'workOrderType',
      key: 'workOrderType',
    },
    {
      title: '审批流程',
      width: 368,
      dataIndex: 'approvalProcess',
      key: 'approvalProcess',
      render: (_, { approvalProcess }, index) => {
        const options = [
          {
            value: '1',
            label: '1',
          },
          {
            value: '2',
            label: '2',
          },
        ];
        options.unshift({
          value: approvalProcess,
          label: approvalProcess,
        });
        return (
          <Select
            defaultValue={approvalProcess}
            options={options}
            onSelect={(e) => console.log(e, index)}
            style={{
              height: '28px',
              width: '240px',
            }}
          />
        );
      },
    },
  ];
  const data: SubDataType[] = [
    {
      workOrderType: '导出',
      approvalProcess: 'export',
    },
    {
      workOrderType: '导入',
      approvalProcess: 'import',
    },
    {
      workOrderType: '模拟数据',
      approvalProcess: 'mock',
    },
    {
      workOrderType: '数据库变更',
      approvalProcess: 'databaseChange',
    },
    {
      workOrderType: '影子表同步',
      approvalProcess: 'shadowSchemaSync',
    },
    {
      workOrderType: 'SQL 计划',
      approvalProcess: 'sqlPlan',
    },
    {
      workOrderType: '分区计划',
      approvalProcess: 'partitionPlan',
    },
    {
      workOrderType: '数据归档',
      approvalProcess: 'dataArchive',
    },
  ];

  const Footer = () => {
    return (
      <Space>
        <Button onClick={cancel}>取消</Button>
        <Button type="primary" onClick={onSubmit}>
          确定
        </Button>
      </Space>
    );
  };
  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      placement="right"
      title="设置审批流程"
      footer={<Footer />}
      footerStyle={{
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      className={classNames(styles.envDrawer)}
      width={520}
    >
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        className={classNames(styles.tableSpin, styles.smallTable, {
          // [styles.scrollAble]: !!scrollHeight,
        })}
      />
    </Drawer>
  );
};

export default env;
