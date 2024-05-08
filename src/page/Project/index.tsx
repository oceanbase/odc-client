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

import { listDatabases } from '@/common/network/database';
import { getProject, listProjects } from '@/common/network/project';
import PageContainer, { TitleType } from '@/component/PageContainer';
import TooltipAction from '@/component/TooltipAction';
import { IProject, ProjectRole } from '@/d.ts/project';
import { IPageType } from '@/d.ts/_index';
import { formatMessage } from '@/util/intl';
import { gotoSQLWorkspace } from '@/util/route';
import tracert from '@/util/tracert';
import { history, Link, useNavigate, useParams } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Button, Space } from 'antd';
import { isNumber } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Database from './Database';
import Notification from './Notification';
import ProjectContext from './ProjectContext';
import Sensitive from './Sensitive';
import Setting from './Setting';
import Task from './Task';
import User from './User';
const ExtraContent = ({ projectId }) => {
  const [disabled, setDisabled] = useState(false);

  const getLoginDatabaseAuth = async () => {
    const res = await listDatabases(projectId, null, null, null, null, null, null, null, true);
    const hasLoginDatabaseAuth = res.contents?.some(
      (item) => !!item.authorizedPermissionTypes.length,
    );
    setDisabled(!hasLoginDatabaseAuth);
  };

  useEffect(() => {
    if (projectId) {
      getLoginDatabaseAuth();
    }
  }, [projectId]);

  return (
    <Space size={12}>
      <TooltipAction title={disabled ? formatMessage({ id: 'src.page.Project.653AB743' }) : ''}>
        <Button
          onClick={() => {
            tracert.click('a3112.b64002.c330858.d367386');
            gotoSQLWorkspace(projectId);
          }}
          type="primary"
          disabled={disabled}
        >
          {
            formatMessage({
              id: 'odc.page.Project.LogOnToTheDatabase',
            }) /*登录数据库*/
          }
        </Button>
      </TooltipAction>
    </Space>
  );
};
interface IProps {}
const Pages = {
  [IPageType.Project_Database]: {
    component: Database,
  },
  [IPageType.Project_Setting]: {
    component: Setting,
  },
  [IPageType.Project_Task]: {
    component: Task,
  },
  [IPageType.Project_User]: {
    component: User,
  },
  [IPageType.Project_Sensitive]: {
    component: Sensitive,
  },
  [IPageType.Project_Notification]: {
    component: Notification,
  },
};
const tabs = [
  {
    tab: formatMessage({
      id: 'odc.page.Project.Database',
    }),
    //数据库
    key: IPageType.Project_Database,
  },
  {
    tab: formatMessage({
      id: 'odc.page.Project.Ticket',
    }),
    //工单
    key: IPageType.Project_Task,
  },
  {
    tab: formatMessage({
      id: 'odc.page.Project.Member',
    }),
    //成员
    key: IPageType.Project_User,
  },
  {
    tab: formatMessage({
      id: 'odc.src.page.Project.Sensitive',
    }), //'敏感列'
    key: IPageType.Project_Sensitive,
  },
  {
    tab: formatMessage({ id: 'src.page.Project.B4D9BC23' }), //'消息'
    key: IPageType.Project_Notification,
  },
  {
    tab: formatMessage({
      id: 'odc.page.Project.Settings',
    }),
    //设置
    key: IPageType.Project_Setting,
  },
];

const Index: React.FC<IProps> = function () {
  const params = useParams<{
    id: string;
    page: IPageType;
  }>();
  const navigate = useNavigate();
  const { id, page } = params;
  const Component = Pages[page].component;
  const projectId = parseInt(id);
  const handleChange = (key: string) => {
    history.push(`/project/${id}/${key}`);
  };
  const handleProjectChange = (value: string) => {
    tracert.click('a3112.b64002.c330857.d367379');
    history.push(`/project/${value}/${page}`);
  };
  const [project, setProject] = useState<IProject>(null);
  async function fetchProject(projectId: number) {
    const data = await getProject(projectId);
    if (data) {
      setProject(data);
    }
  }
  const reloadProject = useCallback(() => {
    fetchProject(projectId);
  }, [project]);
  useEffect(() => {
    if (isNumber(projectId)) {
      fetchProject(projectId);
    }
  }, [projectId]);
  useEffect(() => {
    if (page === IPageType.Project_Sensitive) {
      // 当前项目中只有Developer身份的用户通过url访问Sensitive页面时，跳转到Project，避免用户通过url直接进入Sensitvie页面导致发起错误请求。
      if (
        !project?.currentUserResourceRoles?.some((role) =>
          [ProjectRole.DBA, ProjectRole.OWNER, ProjectRole.SECURITY_ADMINISTRATOR].includes(role),
        )
      ) {
        navigate('/project');
      }
    }
  }, [page]);
  const { data } = useRequest(listProjects, {
    defaultParams: [null, 1, 10],
  });
  const options = [
    {
      label: project?.name,
      value: projectId,
    },
  ].concat(
    data?.contents
      ?.map((p) => {
        if (p.id === projectId) {
          return null;
        }
        return {
          label: p.name,
          value: p.id,
        };
      })
      ?.filter(Boolean) || [],
  );
  const displayTabs = useMemo(() => {
    let roleTabConfig = {
      [ProjectRole.DBA]: [
        IPageType.Project_Database,
        IPageType.Project_Task,
        IPageType.Project_Sensitive,
        IPageType.Project_User,
      ],

      [ProjectRole.DEVELOPER]: [
        IPageType.Project_Database,
        IPageType.Project_Task,
        IPageType.Project_User,
      ],

      [ProjectRole.OWNER]: [
        IPageType.Project_Database,
        IPageType.Project_Task,
        IPageType.Project_Sensitive,
        IPageType.Project_Setting,
        IPageType.Project_User,
        IPageType.Project_Notification,
      ],

      [ProjectRole.SECURITY_ADMINISTRATOR]: [
        IPageType.Project_Database,
        IPageType.Project_Task,
        IPageType.Project_Sensitive,
        IPageType.Project_User,
      ],

      [ProjectRole.PARTICIPANT]: [
        IPageType.Project_Database,
        IPageType.Project_Task,
        IPageType.Project_User,
      ],
    };
    const currentRoles = project?.currentUserResourceRoles || [];
    const roleTabs: IPageType[] = currentRoles?.reduce((prev, current) => {
      return prev.concat(roleTabConfig[current]);
    }, []);
    return tabs.filter((tab) => roleTabs.includes(tab?.key));
  }, [tabs, project]);
  return (
    <PageContainer
      titleProps={{
        type: TitleType.SELECT,
        defaultValue: projectId,
        options: options,
        onChange: handleProjectChange,
        onDropdownVisibleChange(v) {
          v && tracert.expo('a3112.b64002.c330857');
        },
      }}
      // 当前项目中拥有DBA或OWNER身份的用户拥有完整的Tabs，否则隐藏“敏感数据”入口。
      tabList={displayTabs}
      tabActiveKey={page}
      tabBarExtraContent={<ExtraContent projectId={projectId} />}
      containerWrapStyle={
        [IPageType.Project_Notification].includes(page)
          ? {
              padding: '0px 12px',
            }
          : {}
      }
      onTabChange={handleChange}
      bigSelectBottom={
        <Link onClick={() => tracert.click('a3112.b64002.c330857.d367380')} to={'/project'}>
          {
            formatMessage({
              id: 'odc.page.Project.ViewAllProjects',
            }) /*查看所有项目*/
          }
        </Link>
      }
    >
      <ProjectContext.Provider
        value={{
          project,
          projectId,
          reloadProject,
        }}
      >
        <Component key={id} id={id} />
      </ProjectContext.Provider>
    </PageContainer>
  );
};
export default Index;
