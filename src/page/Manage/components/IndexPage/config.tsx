import { IManagerResourceType } from '@/d.ts';
import { formatMessage } from '@/util/intl';

const getIcon = (fileName: string) => {
  return `${window.publicPath}img/${fileName}.png`;
};

export const menusConfig = [
  {
    icon: getIcon('manage_index_resource'),
    title: formatMessage({
      id: 'odc.components.IndexPage.config.ResourcePermissionManagement',
    }),
    //资源权限管理
    describe: formatMessage({
      id: 'odc.components.IndexPage.config.AssignReadAndWritePermissions',
    }),
    //为不同角色的用户分配公共连接、资源组的读写权限，实现数据库资源权限的分配和管控
  },
  {
    icon: getIcon('manage_index_task'),
    title: formatMessage({
      id: 'odc.components.IndexPage.config.TaskFlowManagement',
    }),
    //任务流程管理
    describe: formatMessage({
      id: 'odc.components.IndexPage.config.LimitChangesInitiatedByUsers',
    }),
    //根据任务类型限制用户发起的变更内容、定制不同的审批流程，达到数据库变更安全的目的
  },
  {
    icon: getIcon('manage_index_risk'),
    title: formatMessage({
      id: 'odc.components.IndexPage.config.SecurityAuditManagement',
    }),
    //安全审计管理
    describe: formatMessage({
      id: 'odc.components.IndexPage.config.SupportsTypesOfAuditEvents',
    }), //支持 17 类审计事件类型，确保安全合规，重要事件可追踪，审计报告可下载
  },
];

export const resourceConfig = [
  {
    key: IManagerResourceType.public_connection,
    type: formatMessage({
      id: 'odc.components.IndexPage.config.PublicConnection',
    }),
    //公共连接
    title: formatMessage({
      id: 'odc.components.IndexPage.config.AddPublicConnectionResources',
    }),
    //添加公共连接资源
    describe: formatMessage({
      id: 'odc.components.IndexPage.config.AdministratorsCanCreateOrEdit',
    }),
    //管理员可创建或编辑由多个用户共享的公共连接资源
  },
  {
    key: IManagerResourceType.resource_group,
    type: formatMessage({
      id: 'odc.components.IndexPage.config.ResourceGroup',
    }),
    //资源组
    title: formatMessage({
      id: 'odc.components.IndexPage.config.ConfigureResourceGroups',
    }),
    //设置资源组
    describe: formatMessage({
      id: 'odc.components.IndexPage.config.ContainsMultiplePublicConnectionsIt',
    }),
    //包含多个公共连接，适用于将多个公共连接资源批量授权给角色
  },
  {
    key: IManagerResourceType.role,
    type: formatMessage({ id: 'odc.components.IndexPage.config.Role' }), //角色
    title: formatMessage({
      id: 'odc.components.IndexPage.config.ManageRolePermissions',
    }),
    //管理角色权限
    describe: formatMessage({
      id: 'odc.components.IndexPage.config.GrantMultiplePublicConnectionResource',
    }),
    //为角色赋予多个公共连接资源权限和个人资源权限
  },
  {
    key: IManagerResourceType.user,
    type: formatMessage({ id: 'odc.components.IndexPage.config.User' }), //用户
    title: formatMessage({ id: 'odc.components.IndexPage.config.CreateAUser' }), //创建用户
    describe: formatMessage({
      id: 'odc.components.IndexPage.config.SetThePasswordOfThe',
    }),
    //设置用户账号密码，并通过角色授予相关连接资源权限
  },
];
