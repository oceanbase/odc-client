import { TaskPageType } from '@/d.ts';

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
    status: ['执行成功', '执行失败', '执行中', '待执行', '其他'],
    statusType: [
      'successExecutionCount',
      'failedExecutionCount',
      'executingCount',
      'waitingExecutionCount',
      'otherCount',
    ],
    statusColor: ['#73d13d', '#ff6667', '#40a9ff', '#91d5ff', '#e0e0e0'],
    scheduleTitle: ['数据归档', '数据清理', '分区计划', 'SQL 计划'],
    scheduleType: [
      TaskPageType.DATA_ARCHIVE,
      TaskPageType.DATA_DELETE,
      TaskPageType.PARTITION_PLAN,
      TaskPageType.SQL_PLAN,
    ],
  },
  quickStart: {
    role: ['我是管理员', '我是开发者'],
    descriptions: [
      '团队空间支持项目协同开发，管理员可根据业务实际分配项目与资源、定制管控规则，保障数据库变更过程稳定、高效、可追溯。参考以下任务快速体验：',
      '团队空间支持项目协同开发，开发者可在项目内发起数据导出、变更等工单，或使用 SQL 控制台进行查询和开发。参考以下任务快速体验：',
    ],
    steps: [
      ['添加数据源', '创建项目并分配数据库', '管理风险规则和审批流', '发起一个工单'],
      ['加入一个项目', '生成测试数据', '体验 SQL 查询和开发'],
    ],
  },
  recently: {
    columnNames: ['数据库名称', '所属数据源', '所属项目', '环境', '操作'],
    columnKeys: [
      EDatabaseTableColumnKey.Recently,
      EDatabaseTableColumnKey.DataSource,
      EDatabaseTableColumnKey.Project,
      EDatabaseTableColumnKey.Environment,
      EDatabaseTableColumnKey.Operation,
    ],
    columnDataIndex: ['name', ['dataSource', 'name'], 'project', 'environmentId', 'operation'],
  },
  aboutUs: {
    helps: ['下载新版', '产品动态', '反馈建议'],
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
        title: '“慢”调斯理：OceanBase AP 实时 SQL 诊断能力解析',
        url: 'https://open.oceanbase.com/blog/13170408448',
      },
      {
        title: '数据库历史库，成本与性能不可以兼得吗？',
        url: 'https://open.oceanbase.com/blog/12198675456',
      },
      {
        title: 'ODC SQL 检查自动识别生产环境高危变更',
        url: 'https://open.oceanbase.com/blog/10649375568',
      },
      {
        title: '千人团队的数据库开发工具如何快速集成企业级的账号体系？',
        url: 'https://open.oceanbase.com/blog/10912223568',
      },
      {
        title: 'ODC 代码自动补全竟暗藏运维神器！',
        url: 'https://open.oceanbase.com/blog/10641782355',
      },
    ],
  },
};

export const gridConfig = {
  left: 15,
  right: 9,
  all: 24,
  hide: 0,
};

export const areaLayout = {
  schedules: { schedule: gridConfig.all, guide: 0 },
  both: { schedule: gridConfig.left, guide: gridConfig.right },
  quickStart: { schedule: 0, guide: gridConfig.all },
  hideTop: { schedule: 0, guide: 0 },
};
