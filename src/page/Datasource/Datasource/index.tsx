import PageContainer, { TitleType } from '@/component/PageContainer';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, List, Space, Typography } from 'antd';
import { Link } from 'umi';
import styles from './index.less';

const data = Array(10)
  ?.fill(0)
  ?.map((item, index) => `数据源 ${index + 1}`);

const dataSource = data?.map((item, index) => {
  return {
    name: item,
    id: index,
  };
});

const Project = () => {
  return (
    <PageContainer
      titleProps={{
        type: TitleType.TEXT,
        title: '数据源',
        showDivider: true,
      }}
    >
      <List
        className={styles.content}
        header={
          <div className={styles.header}>
            <Button type="primary">新建数据源</Button>
            <Space>
              <SearchOutlined />
              <ReloadOutlined />
            </Space>
          </div>
        }
        dataSource={dataSource}
        renderItem={(item) => (
          <List.Item>
            <Link to={`/datasource/${item?.id}/info`}>
              <Typography.Text mark>[数据源]</Typography.Text> {item?.name}
            </Link>
          </List.Item>
        )}
      />
    </PageContainer>
  );
};

export default Project;
