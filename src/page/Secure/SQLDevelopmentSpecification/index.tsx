import { Space, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
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
        <a>设置审批流程</a>
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

const SQLDevelopmentSpecification = () => {
  return <Table columns={columns} dataSource={data} />;
};

export default SQLDevelopmentSpecification;
