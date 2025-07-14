import { formatMessage } from '@/util/intl';
import { Divider, Empty } from 'antd';
import styles from './index.less';
import { SettingOutlined } from '@@node_modules/@ant-design/icons/lib';
import { Acess, actionTypes, createPermission } from '@/component/Acess';
import { IManagerResourceType } from '@/d.ts';

interface IProps {
  height?: number;
}

export default ({ height = 160 }: IProps) => {
  return (
    <Acess
      fallback={
        <Empty
          className={styles.datasourceSelectCannotCreateEmpty}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={formatMessage({
            id: 'src.component.Empty.DatasourceSelectEmpty.AD7EB9CC',
            defaultMessage: '暂无数据源，请联系管理员',
          })}
        />
      }
      {...createPermission(IManagerResourceType.resource, actionTypes.create)}
    >
      <div className={styles.datasourceSelectEmptyhWrapper}>
        <Empty
          className={styles.empty}
          style={{ height }}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={formatMessage({
            id: 'src.component.Empty.DatasourceSelectEmpty.41EBD586',
            defaultMessage: '暂无数据源',
          })}
        />

        <Divider />

        <div className={styles.setting}>
          <SettingOutlined color="#1890ff" />
          <span className={styles.action} onClick={() => window.open('#/datasource')}>
            {formatMessage({
              id: 'src.component.Empty.DatasourceSelectEmpty.6DC59C18',
              defaultMessage: '管理数据源',
            })}
          </span>
        </div>
      </div>
    </Acess>
  );
};
