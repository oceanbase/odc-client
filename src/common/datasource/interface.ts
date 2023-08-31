import { ConnectionMode, TaskType } from '@/d.ts';
import { TableForeignConstraintOnDeleteType } from '@/d.ts/table';
import { TableColumn } from '@/page/Workspace/components/CreateTable/interface';

export type columnExtraComponent = React.FC<{
  column: TableColumn;
  originColumns: TableColumn[];
  onChange: (newColumn: TableColumn) => void;
  dialectType?: ConnectionMode;
}>;

interface ICreateTableConfig {
  enableAutoIncrement?: boolean;
  /**
   * 是否开启表的编码
   */
  enableTableCharsetsAndCollations?: boolean;
  /**
   * 约束是否可开启关闭
   */
  constraintEnableConfigurable?: boolean;
  /**
   * 约束是否可配置延迟状态
   */
  constraintDeferConfigurable?: boolean;
  /**
   * 是否有检查约束
   */
  enableCheckConstraint?: boolean;
  /**
   * 是否有级联更新
   */
  enableConstraintOnUpdate?: boolean;
  /**
   * 外键约束级联删除的选项，默认为全部
   */
  constraintForeignOnDeleteConfig?: TableForeignConstraintOnDeleteType[];
  /**
   * column 配置 extra 信息
   */
  ColumnExtraComponent?: columnExtraComponent;
  /**
   * parition相关配置
   */
  disableRangeColumnsPartition?: boolean;
  disableListColumnsPartition?: boolean;
  disableKeyPartition?: boolean;
  disableLinearHashPartition?: boolean;
  /**
   * 分区名大小写敏感
   */
  paritionNameCaseSensitivity?: boolean;
  /**
   * 是否有fulltext的索引方法
   */
  enableIndexesFullTextType?: boolean;
  /**
   * 字段映射
   */
  type2ColumnType?: Record<string, string>;
}

export interface IDataSourceModeConfig {
  priority?: number;
  connection: {
    address: {
      items: ('ip' | 'port' | 'cluster' | 'tenant')[];
    };
    account: boolean;
    sys: boolean;
    ssl: boolean;
    defaultSchema?: boolean;
  };
  features: {
    task: TaskType[];
    allTask?: boolean;
    obclient?: boolean;
    recycleBin?: boolean;
    sqlExplain?: boolean;
    compile?: boolean;
    plEdit?: boolean;
    anonymousBlock?: boolean;
  };
  schema: {
    table: ICreateTableConfig;
  };
  sql: {
    language: string;
    escapeChar: string;
    plParamMode?: 'text' | 'list';
  };
}
