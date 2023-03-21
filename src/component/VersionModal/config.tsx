import appConfig from '@/constant/appConfig';
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
    title: formatMessage({
      id: 'odc.component.VersionModal.config.HomePageManagement',
    }),
    // 首页管理
    content: (
      <div>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.OnTheOdcHomepageYou',
            })
            /* 进入 ODC 首页，可以看到连接列表。在个人连接 TAB
      ，用户可以新建、编辑、删除、登录连接，并可以执行打标签、置顶等操作。在公共连接
      TAB，可以查看、登录已被授权的连接。 */
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

  {
    title: formatMessage({
      id: 'odc.component.VersionModal.config.ConnectionManagement',
    }),

    // 连接管理
    content: (
      <div>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.GoToTheInternalConnection',
            })
            /* 进入连接内部，通过 schema 切换可实现连接内不同 schema 之间的跳转，跳转后可对对应的 schema
      下的对象进行相关的数据库开发工作。
      如果在连接内部，希望打开其它连接，可通过鼠标悬停左上角导航栏中的 ODC 图标，选择 
      [新窗口打开连接] 并发打开多个连接，连接间 session 独立，互不影响。 */
          }
        </Paragraph>
      </div>
    ),

    img: 'connection.jpg',
  },

  {
    title: formatMessage({
      id: 'odc.component.VersionModal.config.BuiltInTools',
    }),
    // 内置工具
    content: (
      <div>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.OdcHasASeriesOf',
            })
            /* ODC 内置了一系列开发工具，进入连接内部，鼠标悬停 [工具] 
      项，可以看到导入、导出、模拟数据等工具。 */
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.TheImportToolAllowsYou',
            })
            /* 通过导入工具可以将通过 ODC 导出的文件、SQL
      文件等导入到数据库中。通过导出工具可将数据库中的结构和数据导出成 SQL 或 CSV
      格式。通过模拟数据工具可以快速为指定表生成指定格式的测试数据，极大提升开发效率。 */
          }
        </Paragraph>
      </div>
    ),

    img: 'tools.jpg',
  },

  {
    title: formatMessage({
      id: 'odc.component.VersionModal.config.SqlWindow',
    }),

    /* SQL 窗口 */ content: (
      <div>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.SqlWindowIsTheMain',
            })
            /* SQL 窗口是用户进行数据库开发的主要功能模块，内置了一系列编辑辅助工具及快捷功能入口。打开
      SQL 窗口，用户可编辑和保存 SQL 或 PL
      语句，在编写过程中会根据语法和语义展示相关提示，已编写内容涉及到关键字部分会高亮展示。同时提供了代码片段功能，用来辅助记忆常用片段，提高编写效率。 */
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.InAdditionToTheSql',
            })
            /* 除了 SQL 窗口外，ODC 提供了匿名块窗口进行匿名块的编辑、运行和调试。此外 ODC
      还支持命令行窗口，通过命令行窗口用户可执行 SQL、运行脚本。 */
          }
        </Paragraph>
      </div>
    ),

    img: 'sqlconsole.jpg',
  },

  {
    title: formatMessage({
      id: 'odc.component.VersionModal.config.ResultSetManagement',
    }),
    // 结果集管理
    content: (
      <div>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.ForSqlTheQueryResult',
            })
            /* 对于 SQL
      查询的结果集，支持行模式、列模式查看。对于文本，支持用文本查看器查看，对于大字段，支持用大字段查看器查看。 */
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.WhenExportingResultSetsYou',
            })
            /* 在对结果集进行导出时，支持选中部分结果集复制成 SQL 语句或 CSV
      文本。同时支持导出全部结果集成 SQL 、CSV 或 EXCEL 格式。 */
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.WhenYouSelectAndCopy',
            })
            /* 在对结果集进行选择复制时，其交互类似 EXCEL
      表格的操作交互。支持全选、单列、多列、单行、多行选择，支持冻结指定行数据，同时支持将结果集的内容直接复制粘贴到
      EXCEL 中。 */
          }
        </Paragraph>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.ForASingleTableQuery',
            })
            /* 对于单表查询，支持对结果集进行编辑，编辑时可根据数据类型提供组件（数字、字符、日期等）辅助编辑。 */
          }
        </Paragraph>
      </div>
    ),

    img: 'resultset.jpg',
  },

  appConfig.debug.enable && {
    title: formatMessage({
      id: 'odc.component.VersionModal.config.PlDebugging',
    }),
    // PL 调试
    content: (
      <div>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.OdcCustomizesPlBasedOn',
            })
            /* ODC 根据 OceanBase 内核的调试能力定制了 PL
      调试模块。调试过程中支持设置、取消断点，提供多种调试模式（批量执行、单步执行、跳入、跳出），并可在结果观察区查看调试过程中各种信息的变化。 */
          }
        </Paragraph>
        <Text strong>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.Note',
            })
            /* 需要注意: */
          }
        </Text>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.ArmVersionObIsNot',
            })
            /* 1、不支持调试 arm 版 OB ； */
          }
        </Paragraph>
      </div>
    ),

    img: 'pldebug.jpg',
  },

  {
    title: formatMessage({
      id: 'odc.component.VersionModal.config.ControlCollaboration',
    }), //管控协同
    content: (
      <div>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.OdcProvidesTheConsoleFunction',
            })
            /* ODC 提供了管控台功能，可根据企业的实际情况配置用户群体的角色和权限(默认内置 system_admin
      角色及 admin 用户)，并可对 ODC
      内的连接资源进行单独和批量管理（可通过资源组实现批量管理的能力），从而可以快速便捷地做到整个
      ODC 平台的权限管控，实现各角色间的高效协作。 */
          }
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.OdcTheVersionProvidesUnified',
            }) /*ODC 3.3.0
          版本开始提供变更统一管控的能力，用户可对公共只读连接数据库变更。该能力包含了变更流程的定义，以及变更流程的发起两部分。管理员用户可定义、调整变更流程，普通用户可根据管理员定义的流程发起变更*/
          }
        </Paragraph>
      </div>
    ),

    img: 'manager.jpg',
  },

  {
    title: formatMessage({
      id: 'odc.component.VersionModal.config.OperationRecords',
    }), //操作记录
    content: (
      <div>
        <Paragraph>
          {
            formatMessage({
              id: 'odc.component.VersionModal.config.ToEnsureThatUserOperations',
            }) /*为了保证用户在 ODC 上进行的操作可追溯，ODC 3.3.0
          版本开始提供了操作记录的能力。该能力包含操作记录查看和操作记录管理两部分。普通用户可根据事件类型、事件操作、所属连接等查找记录、并支持查看操作详情；管理员可查看和导出所有用户的操作记录。*/
          }
        </Paragraph>
      </div>
    ),

    img: 'record.png',
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
