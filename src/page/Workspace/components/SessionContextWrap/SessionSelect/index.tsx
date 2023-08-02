import { formatMessage } from '@/util/intl';
import { useContext, useState } from 'react';
import SessionContext from '../context';

import ConnectionPopover from '@/component/ConnectionPopover';
import Icon, { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import { Popover, Space, Spin, Tag } from 'antd';
import styles from './index.less';

import { ConnectionMode } from '@/d.ts';
import PjSvg from '@/svgr/project_space.svg';
import OBSvg from '@/svgr/source_ob.svg';
import classNames from 'classnames';
import SelectModal from './modal';

export default function SessionSelect({
  readonly,
  dialectTypes,
}: {
  readonly?: boolean;
  dialectTypes?: ConnectionMode[];
}) {
  const context = useContext(SessionContext);
  const [visible, setVisible] = useState(false);

  function renderProject() {
    return (
      <Popover
        overlayClassName={styles.pop}
        placement="bottomLeft"
        content={<ConnectionPopover connection={context?.session?.connection} />}
      >
        <Space size={4}>
          <Icon component={PjSvg} style={{ fontSize: 14, verticalAlign: 'text-bottom' }} />
          <span style={{ verticalAlign: 'top' }}>
            {context?.session?.odcDatabase?.project?.name}
          </span>
        </Space>
      </Popover>
    );
  }

  function renderDatasource() {
    return (
      <Popover
        overlayClassName={styles.pop}
        placement="bottomLeft"
        content={<ConnectionPopover connection={context?.session?.connection} />}
      >
        <Space size={4}>
          <Icon component={OBSvg} style={{ fontSize: 16, verticalAlign: 'text-top' }} />
          <span style={{ verticalAlign: 'top' }}>{context?.session?.connection?.name}</span>
        </Space>
      </Popover>
    );
  }
  function renderEnv() {
    if (!context?.session?.odcDatabase?.environment?.name) {
      return null;
    }
    return (
      <div className={styles.tag}>
        <Tag color={context?.session?.odcDatabase?.environment?.style?.toLowerCase()}>
          {context?.session?.odcDatabase?.environment?.name}
        </Tag>
      </div>
    );
  }
  function renderSessionInfo() {
    if (readonly) {
      return (
        <>
          {renderEnv()}
          <div className={classNames(styles.dataSource, styles.readonly)}>
            {context?.from === 'datasource' || context.datasourceMode
              ? renderDatasource()
              : renderProject()}
          </div>
          {!context.datasourceMode && (
            <>
              <span>/</span>
              <div className={classNames(styles.database, styles.readonly)}>
                {context?.session?.odcDatabase?.name}
              </div>
            </>
          )}
        </>
      );
    }
    return (
      <>
        {renderEnv()}
        <div onClick={() => setVisible(true)} className={styles.dataSource}>
          {context?.from === 'datasource' || context.datasourceMode
            ? renderDatasource()
            : renderProject()}
        </div>
        {!context.datasourceMode && (
          <>
            <span>/</span>
            <div onClick={() => setVisible(true)} className={styles.database}>
              {context?.session?.odcDatabase?.name} <DownOutlined />
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <>
      {!context?.databaseId && !context?.datasourceId ? (
        <div className={styles.line}>
          <a onClick={() => setVisible(true)}>
            {
              formatMessage({
                id: 'odc.SessionContextWrap.SessionSelect.SelectADatabase',
              }) /*请选择数据库*/
            }
          </a>
        </div>
      ) : (
        <div className={styles.line}>
          {context?.session ? (
            renderSessionInfo()
          ) : (
            <Spin
              style={{ marginLeft: 20 }}
              spinning={true}
              indicator={<LoadingOutlined style={{ fontSize: 18 }} spin />}
            />
          )}
        </div>
      )}

      {!readonly && (
        <SelectModal
          dialectTypes={dialectTypes || []}
          visible={visible}
          close={() => setVisible(false)}
        />
      )}
    </>
  );
}
