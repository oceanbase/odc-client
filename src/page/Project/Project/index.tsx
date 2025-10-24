/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { listProjects } from '@/common/network/project';
import { Acess, createPermission } from '@/component/Acess';
import FilterIcon from '@/component/Button/FIlterIcon';
import ProjectEmpty from '@/component/Empty/ProjectEmpty';
import PageContainer, { TitleType } from '@/component/PageContainer';
import ApplyPermissionButton from '@/component/Task/modals/ApplyPermission/CreateButton';
import { actionTypes, IManagerResourceType } from '@/d.ts';
import { IProject, ProjectTabType } from '@/d.ts/project';
import { IPageType } from '@/d.ts/_index';
import { setDefaultProject } from '@/service/projectHistory';
import { formatMessage } from '@/util/intl';
import { useNavigate } from '@umijs/max';
import { List, Space, Spin, Typography, Button, message } from 'antd';
import VirtualList from 'rc-virtual-list';
import { useEffect, useRef, useState } from 'react';
import CreateProjectDrawer from './CreateProject/Drawer';
import styles from './index.less';
import ListItem from './ListItem';
import { UserStore } from '@/store/login';
import MoreBtn from './MoreBtn';
import DeleteProjectModal from '@/page/Project/components/DeleteProjectModal.tsx';
import type { SelectProject } from '@/page/Project/components/DeleteProjectModal.tsx';
import { useSearchParams } from '@umijs/max';
import { getSessionStorageKey } from '../helper';
import { observer, inject } from 'mobx-react';
import InputSelect from '@/component/InputSelect';
import { SyncOutlined } from '@ant-design/icons';
import ListHeader from './ListHeader';

enum ProjectSearchType {
  projectName = 'projectName',
}

export const titleOptions: {
  label: string;
  value: ProjectTabType;
}[] = [
  {
    label: formatMessage({
      id: 'odc.Project.Project.AllProjects',
      defaultMessage: '全部项目',
    }),
    value: ProjectTabType.ALL,
  },
  {
    label: formatMessage({
      id: 'odc.Project.Project.ArchiveProject',
      defaultMessage: '归档项目',
    }),
    value: ProjectTabType.ARCHIVED,
  },
];
interface IProps {
  userStore: UserStore;
}

const Project: React.FC<IProps> = (props) => {
  const domRef = useRef<HTMLDivElement>();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Map<number, boolean>>(
    new Map<number, boolean>(),
  );
  const { userStore } = props;
  const [searchType, setSearchType] = useState<ProjectSearchType>(undefined);
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataSource, setDataSource] = useState<IProject[]>([]);
  const [projectSearchName, setProjectSearchName] = useState(null);
  const [projectType, setProjectType] = useState<ProjectTabType>(ProjectTabType.ALL);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const projectTypeIsArchived = projectType === ProjectTabType.ARCHIVED;

  const [openDeleteProjectModal, setOpenDeleteProjectModal] = useState(false);
  const [selectProjectList, setSelectProjectList] = useState<SelectProject[]>([]);
  const sessionStorageKey = getSessionStorageKey(userStore);

  const appendData = async (currentPage, dataSource, projectType, projectSearchName) => {
    setLoading(true);
    try {
      const projectTypeIsArchived = projectType === ProjectTabType.ARCHIVED;
      const res = await listProjects(projectSearchName, currentPage + 1, 40, projectTypeIsArchived);
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

  function reload(newProjectType?: string, projectSearchName?: string) {
    setCurrentPage(0);
    setDataSource([]);
    appendData(0, [], newProjectType || projectType, projectSearchName);
  }

  useEffect(() => {
    // sessionStorage存在搜索值时，刷新页面请求时需带上搜索值
    const sessionStorageValue = sessionStorage.getItem(sessionStorageKey);
    const params = resolveParams();
    appendData(
      currentPage,
      dataSource,
      params.projectType || projectType,
      sessionStorageValue || projectSearchName,
    );
  }, []);
  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === domRef.current?.clientHeight) {
      appendData(currentPage, dataSource, projectType, projectSearchName);
    }
  };

  function resolveParams() {
    const archived = searchParams.get('archived');
    const obj = {
      projectType: ProjectTabType.ALL,
    };
    if (archived && archived === 'true') {
      setProjectType(ProjectTabType.ARCHIVED);
      obj.projectType = ProjectTabType.ARCHIVED;
      searchParams.delete('archived');
      setSearchParams(searchParams);
    }
    return obj;
  }

  return (
    <PageContainer
      titleProps={{
        type: TitleType.TAB,
        options: titleOptions,
        showDivider: true,
        defaultValue: projectType,
      }}
      onTabChange={(v: ProjectTabType) => {
        setProjectType(v);
        // 切换项目时，带上搜索值/固化值
        const searchValues = projectSearchName || sessionStorage.getItem(sessionStorageKey);
        reload(v, searchValues);
      }}
      tabActiveKey={projectType}
    >
      <List
        className={styles.content}
        header={
          <div className={styles.header}>
            <Space size={12}>
              {!projectTypeIsArchived && (
                <Acess
                  fallback={<span></span>}
                  {...createPermission(IManagerResourceType.project, actionTypes.create)}
                >
                  <CreateProjectDrawer disabled={projectTypeIsArchived} onCreate={() => reload()} />
                </Acess>
              )}
              {!projectTypeIsArchived && (
                <ApplyPermissionButton
                  disabled={projectTypeIsArchived}
                  label={
                    formatMessage({
                      id: 'odc.src.page.Project.Project.JoinTheProject',
                      defaultMessage: '加入项目',
                    }) /* 加入项目 */
                  }
                />
              )}
              {projectTypeIsArchived && (
                <Button
                  onClick={() => {
                    if (!selectProjectList.length) {
                      message.info(
                        formatMessage({
                          id: 'src.page.Project.Project.5CDFAB27',
                          defaultMessage: '请先选择项目',
                        }),
                      );
                      return;
                    }
                    setOpenDeleteProjectModal(true);
                  }}
                >
                  {formatMessage({
                    id: 'src.page.Project.Project.FB11C8F8',
                    defaultMessage: '删除项目',
                  })}
                </Button>
              )}
            </Space>
            <Space size={12} style={{ lineHeight: 1 }}>
              <InputSelect
                searchValue={projectSearchName}
                searchType={searchType}
                selectTypeOptions={[
                  {
                    label: formatMessage({
                      id: 'odc.Project.Project.ProjectName',
                      defaultMessage: '项目名称',
                    }),
                    value: ProjectSearchType?.projectName,
                  },
                ]}
                onSelect={({ searchValue, searchType }) => {
                  if (searchValue) {
                    sessionStorage.setItem(sessionStorageKey, searchValue);
                  } else {
                    sessionStorage.removeItem(sessionStorageKey);
                  }
                  setProjectSearchName(searchValue);
                  setSearchType(searchType as ProjectSearchType);
                  reload(null, searchValue);
                }}
              />
              <FilterIcon onClick={() => reload()} border>
                <SyncOutlined spin={loading} />
              </FilterIcon>
            </Space>
          </div>
        }
      >
        <ListHeader projectTypeIsArchived={projectTypeIsArchived} />
        <div
          ref={domRef}
          style={{
            height: '100%',
          }}
        >
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
                    setDefaultProject(p.id);
                    navigate(`/project/${p.id}/${IPageType.Project_Database}`);
                  }}
                  selectProjectList={selectProjectList}
                  onSelectChange={(isSelected, values) => {
                    if (isSelected) {
                      setSelectProjectList([...selectProjectList, values]);
                    } else {
                      setSelectProjectList(
                        selectProjectList.filter((item) => item.id !== values.id),
                      );
                    }
                  }}
                  data={item}
                  action={
                    projectTypeIsArchived ? (
                      <Space
                        size={14}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <MoreBtn project={item} reload={reload} />
                      </Space>
                    ) : null
                  }
                />
              )}
            </VirtualList>
          ) : (
            <Spin spinning={loading} wrapperClassName={styles.spin}>
              <Space direction="vertical" align="center">
                {!loading && (
                  <ProjectEmpty
                    type={projectType}
                    renderActionButton={() => {
                      return (
                        <div className={styles.projectActions}>
                          <Acess
                            fallback={
                              <ApplyPermissionButton
                                disabled={projectTypeIsArchived}
                                type="primary"
                                label={
                                  formatMessage({
                                    id: 'odc.src.page.Project.Project.JoinTheProject',
                                    defaultMessage: '加入项目',
                                  }) /* 加入项目 */
                                }
                              />
                            }
                            {...createPermission(IManagerResourceType.project, actionTypes.create)}
                          >
                            <CreateProjectDrawer
                              disabled={projectTypeIsArchived}
                              onCreate={() => reload()}
                            />
                          </Acess>
                        </div>
                      );
                    }}
                  />
                )}
              </Space>
            </Spin>
          )}
        </div>
      </List>
      <DeleteProjectModal
        open={openDeleteProjectModal}
        setOpen={setOpenDeleteProjectModal}
        projectList={selectProjectList}
        verifyValue={'delete'}
        afterDelete={() => {
          reload();
          setSelectProjectList([]);
        }}
      />
    </PageContainer>
  );
};
export default inject('userStore')(observer(Project));
