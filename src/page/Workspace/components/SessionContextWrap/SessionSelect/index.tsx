import { useContext, useState } from 'react';
import SessionContext from '../context';

import ConnectionPopover from '@/component/ConnectionPopover';
import Icon, { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import { Popover, Space, Spin, Tag } from 'antd';
import styles from './index.less';

import PjSvg from '@/svgr/project_space.svg';
import OBSvg from '@/svgr/source_ob.svg';
import SelectModal from './modal';

export default function SessionSelect() {
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

  return (
    <>
      {!context?.databaseId ? (
        <div className={styles.line}>
          <a onClick={() => setVisible(true)}>请选择数据库</a>
        </div>
      ) : (
        <div className={styles.line}>
          {context?.session ? (
            <>
              <div className={styles.tag}>
                <Tag color={context?.session?.odcDatabase?.environment?.style?.toLowerCase()}>
                  {context?.session?.odcDatabase?.environment?.name}
                </Tag>
              </div>
              <div className={styles.dataSource}>
                {context?.from === 'datasource' ? renderDatasource() : renderProject()}
              </div>
              <span>/</span>
              <div onClick={() => setVisible(true)} className={styles.database}>
                {context?.session?.odcDatabase?.name} <DownOutlined />
              </div>
            </>
          ) : (
            <Spin
              style={{ marginLeft: 20 }}
              spinning={true}
              indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />}
            />
          )}
        </div>
      )}
      <SelectModal visible={visible} close={() => setVisible(false)} />
    </>
  );
}
