import { formatMessage } from '@/util/intl';
import { SQLConsoleResourceType } from '@/common/datasource/interface';
import NewDatasourceButton from '@/page/Datasource/Datasource/NewDatasourceDrawer/NewButton';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import login from '@/store/login';
import { Empty } from 'antd';
import { useContext } from 'react';
import styles from './index.less';

interface IProps {
  type?: SQLConsoleResourceType;
}

export function SQLConsoleEmpty(props: IProps) {
  const { type = '' } = props;
  const context = useContext(ResourceTreeContext);

  const renderDescription = () => {
    switch (type) {
      case SQLConsoleResourceType.DataSource:
        return login.isPrivateSpace() ? (
          <div>
            <div className={styles.description}>
              {formatMessage({
                id: 'src.component.Empty.SQLConsoleEmpty.7F1533E2',
                defaultMessage: '暂无数据源',
              })}
            </div>
            <NewDatasourceButton onSuccess={() => context?.reloadDatasourceList()} />
          </div>
        ) : null;
      case SQLConsoleResourceType.Script:
        return (
          <div>
            <div className={styles.description}>
              {formatMessage({
                id: 'src.component.Empty.SQLConsoleEmpty.25373981',
                defaultMessage: '暂无数据',
              })}
            </div>
            <div className={styles.tips}>
              <div>
                {formatMessage({
                  id: 'src.component.Empty.SQLConsoleEmpty.84DB6D00',
                  defaultMessage: '可上传多个本地脚本文件 (.sql 文件) ,',
                })}
              </div>
              <div>
                {formatMessage({
                  id: 'src.component.Empty.SQLConsoleEmpty.AE01D1B2',
                  defaultMessage: '或将 SQL 窗口保存为脚本',
                })}
              </div>
            </div>
          </div>
        );

      case SQLConsoleResourceType.Snippet:
        return (
          <div>
            <div className={styles.description}>
              {formatMessage({
                id: 'src.component.Empty.SQLConsoleEmpty.3A490E08',
                defaultMessage: '暂无数据',
              })}
            </div>
            <div className={styles.tips}>
              <div>
                {formatMessage({
                  id: 'src.component.Empty.SQLConsoleEmpty.52783297',
                  defaultMessage: '支持新建不同类型 (DDL/DML等) 等代码片段',
                })}
              </div>
              <div>
                {formatMessage({
                  id: 'src.component.Empty.SQLConsoleEmpty.8786FBDD',
                  defaultMessage: '可在 SQL 窗口内快速引用',
                })}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className={styles.description}>
            {formatMessage({
              id: 'src.component.Empty.SQLConsoleEmpty.320656B1',
              defaultMessage: '暂无数据',
            })}
          </div>
        );
    }
  };
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={renderDescription()} />;
}
