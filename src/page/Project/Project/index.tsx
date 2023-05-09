import PageContainer, { TitleType } from '@/component/PageContainer';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, List, Space, Typography } from 'antd';
import { Link } from 'umi';
import styles from './index.less';

const data = Array(10)
  ?.fill(0)
  ?.map((item, index) => `项目 ${index + 1}`);

const dataSource = data?.map((item, index) => {
  return {
    name: item,
    id: index,
  };
});

const titleOptions = [
  {
    label: '全部项目',
    value: 'item-1',
  },
  {
    label: '归档项目',
    value: 'item-2',
  },
];

const Project = () => {
  const handleChange = (value: string) => {};

  return (
    <PageContainer
      titleProps={{
        type: TitleType.TAB,
        options: titleOptions,
        onChange: handleChange,
        showDivider: true,
      }}
    >
      <List
        className={styles.content}
        header={
          <div className={styles.header}>
            <Button type="primary">新建项目</Button>
            <Space>
              <SearchOutlined />
              <ReloadOutlined />
            </Space>
          </div>
        }
        dataSource={dataSource}
        renderItem={(item) => (
          <List.Item>
            <Link to={`/project/${item?.id}/database`}>
              <Typography.Text mark>[项目]</Typography.Text> {item?.name}
            </Link>
          </List.Item>
        )}
      />
    </PageContainer>
  );
};

export default Project;
