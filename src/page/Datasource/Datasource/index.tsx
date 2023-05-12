import { listDataSources } from '@/common/network/dataSource';
import Reload from '@/component/Button/Reload';
import PageContainer, { TitleType } from '@/component/PageContainer';
import { IDatasource } from '@/d.ts/datasource';
import { IPageType } from '@/d.ts/_index';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { List, Space } from 'antd';
import VirtualList from 'rc-virtual-list';
import { useEffect, useRef, useState } from 'react';
import BatchImportDrawer from './BatchImportDrawer';
import CreateDataSourceDrawer from './CreateDataSourceDrawer';
import styles from './index.less';
import ListItem from './ListItem';

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
  const domRef = useRef<HTMLDivElement>();
  const [currentPage, setCurrentPage] = useState(0);
  const [dataSource, setDataSource] = useState<IDatasource[]>([]);
  const navigate = useNavigate();
  const appendData = async (currentPage, dataSource) => {
    const res = await listDataSources('', currentPage + 1, 40);
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
        type: TitleType.TEXT,
        title: '数据源',
        showDivider: true,
      }}
    >
      <List
        className={styles.content}
        header={
          <div className={styles.header}>
            <Space>
              <CreateDataSourceDrawer />
              <BatchImportDrawer />
            </Space>
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
                  navigate(`/datasource/${p.id}/${IPageType.Datasource_info}`);
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
