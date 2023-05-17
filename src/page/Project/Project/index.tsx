import { listProjects } from '@/common/network/project';
import FilterIcon from '@/component/Button/FIlterIcon';
import Reload from '@/component/Button/Reload';
import Search from '@/component/Input/Search';
import PageContainer, { TitleType } from '@/component/PageContainer';
import { IProject } from '@/d.ts/project';
import { IPageType } from '@/d.ts/_index';
import { useNavigate } from '@umijs/max';
import { Empty, List, Space, Spin } from 'antd';
import VirtualList from 'rc-virtual-list';
import { useEffect, useRef, useState } from 'react';
import CreateProjectDrawer from './CreateProject/Drawer';
import styles from './index.less';
import ListItem from './ListItem';

const titleOptions: { label: string; value: 'all' | 'deleted' }[] = [
  {
    label: '全部项目',
    value: 'all',
  },
  {
    label: '归档项目',
    value: 'deleted',
  },
];

const Project = () => {
  const domRef = useRef<HTMLDivElement>();
  const [currentPage, setCurrentPage] = useState(0);
  const [dataSource, setDataSource] = useState<IProject[]>([]);
  const [projectSearchName, setProjectSearchName] = useState(null);
  const [projectType, setProjectType] = useState<'all' | 'deleted'>('all');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isProjectDeleted = projectType === 'deleted';

  const appendData = async (currentPage, dataSource, projectType) => {
    setLoading(true);
    try {
      const isProjectDeleted = projectType === 'deleted';
      const res = await listProjects(projectSearchName, currentPage + 1, 40, isProjectDeleted);
      if (res) {
        setCurrentPage(currentPage + 1);
        /**
         * 去除重复
         */
        const existIds = new Set();
        dataSource.forEach((item) => existIds.add(item.id));

        setDataSource(dataSource.concat(res?.contents.filter((item) => !existIds.has(item.id))));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  function reload(newProjectType?: string) {
    setCurrentPage(0);
    setDataSource([]);
    appendData(0, [], newProjectType || projectType);
  }

  useEffect(() => {
    appendData(currentPage, dataSource, projectType);
  }, []);

  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === domRef.current?.clientHeight) {
      appendData(currentPage, dataSource, projectType);
    }
  };

  return (
    <PageContainer
      titleProps={{
        type: TitleType.TAB,
        options: titleOptions,
        showDivider: true,
        defaultValue: projectType,
      }}
      onTabChange={(v: 'all' | 'deleted') => {
        setProjectType(v);
        reload(v);
      }}
    >
      <List
        className={styles.content}
        header={
          <div className={styles.header}>
            {<CreateProjectDrawer disabled={isProjectDeleted} onCreate={() => reload()} />}
            <Space size={12}>
              <Search
                onSearch={(v) => {
                  setProjectSearchName(v);
                  reload();
                }}
                searchTypes={[
                  {
                    label: '项目名称',
                    value: 'projectName',
                  },
                ]}
              />
              <FilterIcon onClick={() => reload()}>
                <Reload />
              </FilterIcon>
            </Space>
          </div>
        }
      >
        <div ref={domRef} style={{ height: '100%' }}>
          {dataSource?.length ? (
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
                    if (isProjectDeleted) {
                      return;
                    }
                    navigate(`/project/${p.id}/${IPageType.Project_Database}`);
                  }}
                  data={item}
                />
              )}
            </VirtualList>
          ) : (
            <Spin spinning={loading}>
              <Empty />
            </Spin>
          )}
        </div>
      </List>
    </PageContainer>
  );
};

export default Project;
