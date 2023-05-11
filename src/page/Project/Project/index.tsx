import { listProjects } from '@/common/network/project';
import PageContainer, { TitleType } from '@/component/PageContainer';
import { IProject } from '@/d.ts/project';
import { IPageType } from '@/d.ts/_index';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { Button, List, Space } from 'antd';
import VirtualList from 'rc-virtual-list';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import ListItem from './ListItem';

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
  const domRef = useRef<HTMLDivElement>();
  const [currentPage, setCurrentPage] = useState(0);
  const [dataSource, setDataSource] = useState<IProject[]>([]);
  const navigate = useNavigate();

  const appendData = async () => {
    const res = await listProjects('', currentPage + 1, 20);
    if (res) {
      setCurrentPage(currentPage + 1);
      setDataSource(dataSource.concat(res?.contents));
    }
  };

  useEffect(() => {
    appendData();
  }, []);

  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === domRef.current?.clientHeight) {
      appendData();
    }
  };

  return (
    <PageContainer
      titleProps={{
        type: TitleType.TAB,
        options: titleOptions,
        onChange: () => {},
        showDivider: true,
      }}
    >
      <List
        className={styles.content}
        header={
          <div className={styles.header}>
            <Button type="primary">新建项目</Button>
            <Space size={12}>
              <SearchOutlined />
              <ReloadOutlined />
            </Space>
          </div>
        }
      >
        <div ref={domRef} style={{ height: '100%' }}>
          <VirtualList
            data={dataSource}
            height={domRef.current?.clientHeight}
            itemHeight={40}
            itemKey="id"
            onScroll={onScroll}
          >
            {(item) => (
              <ListItem
                onClick={(p) => {
                  navigate(`/project/${p.id}/${IPageType.Project_Database}`);
                }}
                data={item}
              />
            )}
          </VirtualList>
        </div>
      </List>
    </PageContainer>
  );
};

export default Project;
