import { listProjects } from '@/common/network/project';
import Reload from '@/component/Button/Reload';
import PageContainer, { TitleType } from '@/component/PageContainer';
import { IProject } from '@/d.ts/project';
import { IPageType } from '@/d.ts/_index';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { List, Space } from 'antd';
import VirtualList from 'rc-virtual-list';
import { useEffect, useRef, useState } from 'react';
import CreateProjectDrawer from './CreateProject/Drawer';
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

  const appendData = async (currentPage, dataSource) => {
    const res = await listProjects('', currentPage + 1, 40);
    if (res) {
      setCurrentPage(currentPage + 1);
      /**
       * 去除重复
       */
      const existIds = new Set();
      dataSource.forEach((item) => existIds.add(item.id));

      setDataSource(dataSource.concat(res?.contents.filter((item) => !existIds.has(item.id))));
    }
  };

  function reload() {
    setCurrentPage(0);
    setDataSource([]);
    appendData(0, []);
  }

  useEffect(() => {
    appendData(currentPage, dataSource);
  }, []);

  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === domRef.current?.clientHeight) {
      appendData(currentPage, dataSource);
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
            <CreateProjectDrawer onCreate={() => reload()} />
            <Space size={12}>
              <SearchOutlined />
              <Reload onClick={reload} />
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
