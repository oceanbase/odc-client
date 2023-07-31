import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Typography } from 'antd';
import type { VersionMenuType } from './index';

const { Text } = Typography;
const { Paragraph } = Typography;

function getVersionModalImg(fileName: string) {
  return `${window.publicPath}img/versionImg/${fileName}`;
}

const webVersionInfo: VersionMenuType[] = [
  {
    title: formatMessage({ id: 'odc.component.VersionModal.config.EfficientDevelopment' }), //高效开发
    content: (
      <div>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.OdcProvidesRichAndEasy',
            }) /*ODC 提供了丰富且易用的工具能力，帮助您快速进行数据库开发。*/
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.OdcProvidesDatabaseObjectManagement',
            }) /*ODC 提供了数据库对象管理、数据导入导出、SQL 编辑与执行、PL
          编译与调试、数据生成、执行分析、数据库运维等工具能力。*/
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.AtTheSameTimeIn',
            }) /*同时为了提高您的使用体验，也做了如下功能设计：支持拖拽对象生成 SQL 语句、支持类 EXCEL
          的结果集编辑交互、在编辑 SQL 时支持语法高亮和 SQL
          自动补全、支持代码片段的定义与引用以及支持快速生成测试数据等。*/
          }
        </Paragraph>
      </div>
    ),

    img: 'index.jpg',
  },

  {
    title: formatMessage({ id: 'odc.component.VersionModal.config.ChangeRiskControl' }), //变更风险管控
    content: (
      <div>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.OdcProvidesACompleteSolution',
            }) /*ODC 为生产安全场景提供了完备的解决方案。*/
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.FirstTheDatabaseAddressAnd',
            }) /*首先数据库地址和账号密码信息由 DBA 录入，并授权给开发者访问，避免账号密码泄漏。*/
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.SecondlyOdcProvidesPerfectDatabase',
            }) /*其次 ODC 提供了完善的数据库开发规范，您可以根据环境差异灵活地定义 SQL 检查规则和 SQL
          窗口拦截规则。根据不同的风险等级，对您的操作进行建议、上升至 DBA
          审批或拦截，控制变更风险保障生产系统稳定运行。*/
          }
        </Paragraph>
      </div>
    ),

    img: 'connection.jpg',
  },

  {
    title: formatMessage({ id: 'odc.component.VersionModal.config.SecurityCompliance' }), //安全合规
    content: (
      <div>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.OdcProvidesDataDesensitizationAnd',
            }) /*ODC 提供了数据脱敏和细粒度审计能力保障数据安全和合规。*/
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.OdcHasBuiltInPerfect',
            }) /*ODC 内置了完善的脱敏算法和灵活的识别规则，可以保证您在 SQL
          窗口访问、数据出库等场景下敏感数据的安全，满足隐私数据安全合规的诉求。*/
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.AtTheSameTimeOdc',
            }) /*同时 ODC 还提供了操作审计和 SQL 审计的能力。您在 ODC
          上所有的功能操作都会被同步到操作记录中心，此外在 ODC 上发起的所有 SQL 请求也会被记录。*/
          }
        </Paragraph>
      </div>
    ),

    img: 'tools.jpg',
  },

  {
    title: formatMessage({ id: 'odc.component.VersionModal.config.DataLifecycleManagement' }), //数据生命周期管理
    content: (
      <div>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.OdcProvidesDataLifecycleManagement',
            }) /*ODC 提供了数据生命周期管理能力来为您提供数据处理解决方案。ODC
          的数据处理能力包括数据清理、数据归档和分区计划。*/
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.ThroughDataCleaningYouCan',
            }) /*通过数据清理，您可以定期清理掉业务表中的过期数据，实现在线库的瘦身。*/
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.ThroughDataArchivingYouCan',
            }) /*通过数据归档，您可以配置灵活的归档条件，实现冷热数据分离。*/
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.PartitionPlanningAllowsYouTo',
            }) /*通过分区计划，您可以按需求定期新增和删除分区，实现 RANGE 分区自动维护。*/
          }
        </Paragraph>
      </div>
    ),

    img: 'sqlconsole.jpg',
  },

  {
    title: formatMessage({ id: 'odc.component.VersionModal.config.OpenIntegration' }), //开放集成
    content: (
      <div>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.OdcSupportsSingleSignOn',
            }) /*ODC 支持单点登录、工单审批集成、SQL 审核集成及数据库堡垒机集成。*/
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.SingleSignOnSsoSupports',
            }) /*单点登录（SSO）支持 OAuth2、OIDC 协议。*/
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.TicketApprovalSupportsBpmsAnd',
            }) /*工单审批支持 BPMS 和自定义审批系统。*/
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.SqlAuditAllowsYouTo',
            }) /*SQL 审核支持您使用企业已有的 SQL 审核平台对 ODC 内执行的 SQL 语句进行审核。*/
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.DatabaseBastionMachineIntegrationSupports',
            }) /*数据库堡垒机集成支持票据的自动登录和数据库账密的自动填写等能力。*/
          }
        </Paragraph>
      </div>
    ),

    img: 'resultset.jpg',
  },

  {
    title: formatMessage({ id: 'odc.component.VersionModal.config.CollaborationEfficiency' }), //协同效率
    content: (
      <div>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.OdcProvidesASeriesOf',
            }) /*ODC 提供了一系列功能、设计理念来帮助提升您的效率。*/
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.ForExampleYouCanUse',
            }) /*比如您可以通过批量导入的能力避免繁重的手动单条录入。*/
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.ForExampleTheProjectOwner',
            }) /*又比如项目 OWNER 负责管理项目所有数据库和成员、项目 DBA 负责管理项目所有数据库、项目
          DEVELOPER
          专注访问项目所有数据库，不需要为协作者配置复杂的权限，只需把协作者加入到指定的项目中即可实现团队协作模式。*/
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.ForExampleYouCanConfigure',
            }) /*再比如通过配置自动授权规则，实现了根据访问者是否触发授权条件来自动给访问者授权。*/
          }
        </Paragraph>
      </div>
    ),

    img: 'pldebug.jpg',
  },
].filter(Boolean);

const clientVersionInfo: VersionMenuType[] = [
  {
    title: formatMessage({
      id: 'odc.component.VersionModal.config.HomePageManagement',
    }),
    // 首页管理
    content: (
      <div>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.OnTheOdcHomepageYou.1',
            })
            /* 进入 ODC 首页，可以看到连接列表。在个人连接 TAB
      ，用户可以新建、编辑、删除、登录连接，并可以执行打标签、置顶等操作。 */
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.HistoryOnTheHomePage',
            })
            /* 首页的 [历史记录] 保存了最近 48h 的登录记录，用户可通过该入口快速恢复未保存的 SQL
      窗口内容。 */
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.TheHomepageNavigationBarProvides',
            })
            /* 首页导航栏提供了部分功能的快捷入口，其中鼠标悬停账号下可以看到 [个人设置] 
      入口，用户可根据自己的开发习惯自定义分隔符、Oracle 或 MySQL
      的事务提交模式以及查询结果条数限制。 */
          }
        </Paragraph>
      </div>
    ),

    img: 'index.jpg',
  },

  webVersionInfo[1],
  webVersionInfo[2],
  webVersionInfo[3],
  webVersionInfo[4],
  webVersionInfo[5],
  {
    title: formatMessage({
      id: 'odc.component.VersionModal.config.OperationRecords',
    }), //操作记录
    content: (
      <div>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.ToEnsureThatUserOperations.1',
            }) /*为了保证用户在 ODC 上进行的操作可追溯，ODC
      3.3.0及之后版本提供了操作记录的能力。用户可根据事件类型、事件操作、所属连接等查找记录，并支持查看操作详情。操作记录的保留时间为30天，30天之外的操作记录不再支持查看。*/
          }
        </Paragraph>
      </div>
    ),

    img: 'record.png',
  },
];

export const getCurrentVersionInfo = function () {
  const versionInfo = isClient() ? clientVersionInfo : webVersionInfo;
  return versionInfo.map((info) => {
    return {
      ...info,
      img: getVersionModalImg(info.img),
    };
  });
};
