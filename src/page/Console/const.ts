import { formatMessage } from '@/util/intl';
import { TaskPageType } from '@/d.ts';
import { title } from 'process';

export enum EQuickStartRole {
  Admin,
  Develepor,
}

export enum EDatabaseTableColumnKey {
  Recently = 'recently',
  DataSource = 'datasource',
  Project = 'project',
  Environment = 'environment',
  Operation = 'operation',
}

export const ConsoleTextConfig = {
  schdules: {
    keys: ['dataArchive', 'dataClear', 'partition', 'sqlPlan'],
    status: [
      formatMessage({ id: 'src.page.Console.4D58E4BD', defaultMessage: '执行成功' }),
      formatMessage({ id: 'src.page.Console.0DE02703', defaultMessage: '执行失败' }),
      formatMessage({ id: 'src.page.Console.095A8212', defaultMessage: '执行中' }),
      formatMessage({ id: 'src.page.Console.A46DFDCA', defaultMessage: '待执行' }),
      formatMessage({ id: 'src.page.Console.32807E76', defaultMessage: '其他' }),
    ],
    statusType: [
      'successExecutionCount',
      'failedExecutionCount',
      'executingCount',
      'waitingExecutionCount',
      'otherCount',
    ],

    statusColor: ['#73d13d', '#ff6667', '#40a9ff', '#91d5ff', '#e0e0e0'],
    scheduleTitle: [
      formatMessage({ id: 'src.page.Console.B92D6192', defaultMessage: '数据归档' }),
      formatMessage({ id: 'src.page.Console.E2F84D37', defaultMessage: '数据清理' }),
      formatMessage({ id: 'src.page.Console.A9C48F30', defaultMessage: '分区计划' }),
      formatMessage({ id: 'src.page.Console.E561DFFF', defaultMessage: 'SQL 计划' }),
    ],
    scheduleType: [
      TaskPageType.DATA_ARCHIVE,
      TaskPageType.DATA_DELETE,
      TaskPageType.PARTITION_PLAN,
      TaskPageType.SQL_PLAN,
    ],
  },
  quickStart: {
    role: [
      formatMessage({ id: 'src.page.Console.AF3D84A0', defaultMessage: '我是管理员' }),
      formatMessage({ id: 'src.page.Console.2D54E921', defaultMessage: '我是开发者' }),
    ],
    descriptions: [
      formatMessage({
        id: 'src.page.Console.3FDC0120',
        defaultMessage:
          '团队空间支持项目协同开发，管理员可根据业务实际分配项目与资源、定制管控规则，保障数据库变更过程稳定、高效、可追溯。参考以下任务快速体验：',
      }),
      formatMessage({
        id: 'src.page.Console.1593C8C2',
        defaultMessage:
          '团队空间支持项目协同开发，开发者可在项目内发起数据导出、变更等工单，或使用 SQL 控制台进行查询和开发。参考以下任务快速体验：',
      }),
    ],

    steps: [
      [
        formatMessage({ id: 'src.page.Console.170470F0', defaultMessage: '添加数据源' }),
        formatMessage({ id: 'src.page.Console.E7995F1C', defaultMessage: '创建项目并分配数据库' }),
        formatMessage({ id: 'src.page.Console.FAF37E03', defaultMessage: '管理风险规则和审批流' }),
        formatMessage({ id: 'src.page.Console.1A6CAD7C', defaultMessage: '发起一个工单' }),
      ],
      [
        formatMessage({ id: 'src.page.Console.2994ACD6', defaultMessage: '加入一个项目' }),
        formatMessage({ id: 'src.page.Console.BA100E5E', defaultMessage: '生成测试数据' }),
        formatMessage({ id: 'src.page.Console.DD9DC97D', defaultMessage: '体验 SQL 查询和开发' }),
      ],
    ],
  },
  recently: {
    columnNames: [
      formatMessage({ id: 'src.page.Console.F938665F', defaultMessage: '数据库名称' }),
      formatMessage({ id: 'src.page.Console.41896A1C', defaultMessage: '所属数据源' }),
      formatMessage({ id: 'src.page.Console.385D9101', defaultMessage: '所属项目' }),
      formatMessage({ id: 'src.page.Console.3F90E879', defaultMessage: '环境' }),
      formatMessage({ id: 'src.page.Console.C79E24E1', defaultMessage: '操作' }),
    ],
    columnKeys: [
      EDatabaseTableColumnKey.Recently,
      EDatabaseTableColumnKey.DataSource,
      EDatabaseTableColumnKey.Project,
      EDatabaseTableColumnKey.Environment,
      EDatabaseTableColumnKey.Operation,
    ],

    columnDataIndex: ['name', ['dataSource', 'name'], 'project', 'environmentId', 'operation'],
    columnWidth: [204, 208, 160, 100, 208],
  },
  aboutUs: {
    helps: [
      formatMessage({ id: 'src.page.Console.D66A7480', defaultMessage: '下载新版' }),
      formatMessage({ id: 'src.page.Console.B27ADAC6', defaultMessage: '产品动态' }),
      formatMessage({ id: 'src.page.Console.9B6E647E', defaultMessage: '反馈建议' }),
    ],
    urls: [
      'https://www.oceanbase.com/softwarecenter',
      'https://www.oceanbase.com/product/oceanbase-developer-center-rn/releaseNote',
      'https://github.com/oceanbase/odc/issues',
    ],

    QRUrl:
      'https://qr.dingtalk.com/action/joingroup?code=v1,k1,HovdSAqfBdRGqRk2jQ0TDu1eMvQ+BB6rt8mFHeIqi/A=&_dt_no_comment=1&origin=11',
  },
  bestPractice: {
    articles: [
      {
        title: formatMessage({
          id: 'src.page.Console.470D66DD',
          defaultMessage: 'OceanBase AP 实时 SQL 诊断能力解析',
        }),
        url: 'https://www.oceanbase.com/docs/common-odc-1000000002687235',
      },
      {
        title: formatMessage({
          id: 'src.page.Console.9D0C276D',
          defaultMessage: '优化管理数据库历史库',
        }),
        url: 'https://www.oceanbase.com/docs/common-odc-1000000002687236',
      },
      {
        title: formatMessage({
          id: 'src.page.Console.67004EA1',
          defaultMessage: 'ODC SQL 检查自动识别高危操作',
        }),
        url: 'https://www.oceanbase.com/docs/common-odc-1000000002687237',
      },
      {
        title: formatMessage({
          id: 'src.page.Console.4F744942',
          defaultMessage: '快速集成 ODC 的企业级账号体系',
        }),
        url: 'https://www.oceanbase.com/docs/common-odc-1000000002687238',
      },
      {
        title: formatMessage({
          id: 'src.page.Console.15BABD7A',
          defaultMessage: '企业级管控协同：守护数据库的每一次变更',
        }),
        url: 'https://www.oceanbase.com/docs/common-odc-1000000002687239',
      },
      {
        title: formatMessage({
          id: 'src.page.Console.A0F9F190',
          defaultMessage: '通过 ODC 实现分库分表的管理和变更',
        }),
        url: 'https://www.oceanbase.com/docs/common-odc-1000000002687240',
      },
      {
        title: formatMessage({
          id: 'src.page.Console.7BD8C2BB',
          defaultMessage: '数据脱敏管控实践',
        }),
        url: 'https://www.oceanbase.com/docs/common-odc-1000000002687241',
      },
      {
        title: formatMessage({
          id: 'src.page.Console.343BA069',
          defaultMessage: 'SQL 开发常用小技巧',
        }),
        url: 'https://www.oceanbase.com/docs/common-odc-1000000002687242',
      },
    ],
  },
};

export const gridConfig = {
  left: 16,
  right: 8,
  all: 24,
  hide: 0,
};

export const areaLayout = {
  schedules: { schedule: gridConfig.all, guide: 0 },
  both: { schedule: gridConfig.left, guide: gridConfig.right },
  quickStart: { schedule: 0, guide: gridConfig.all },
  hideTop: { schedule: 0, guide: 0 },
};
