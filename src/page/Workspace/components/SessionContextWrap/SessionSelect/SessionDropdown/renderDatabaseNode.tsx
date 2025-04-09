import { hasPermission } from '@/component/Task/helper';
import { TaskType } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import DatabasesTitle from './components/DatabasesTitle';
import { getIcon, NodeType } from './helper';
import styles from './index.less';

const renderDatabaseNode = (parmas: {
  taskType: TaskType;
  database: IDatabase;
  canCheckedDbKeys?: number[];
}) => {
  const { taskType, database, canCheckedDbKeys } = parmas;
  let dbDisabled: boolean = false;
  if (taskType) {
    dbDisabled = !hasPermission(taskType, database.authorizedPermissionTypes);
  } else {
    dbDisabled = !database.authorizedPermissionTypes?.length;
  }
  !dbDisabled && canCheckedDbKeys && canCheckedDbKeys.push(database.id);

  return {
    title: <DatabasesTitle taskType={taskType} db={database} disabled={dbDisabled} />,
    key: database.id,
    selectable: true,
    isLeaf: true,
    icon: (
      <div className={styles.databaseIconContainer}>
        {getIcon({ type: NodeType.Database, database })}
      </div>
    ),
    data: database,
    disabled: dbDisabled,
    type: NodeType.Database,
  };
};
export default renderDatabaseNode;
