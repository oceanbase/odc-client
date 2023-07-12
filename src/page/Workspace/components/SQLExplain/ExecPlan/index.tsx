import { formatMessage } from '@/util/intl';
import { Button, Drawer, Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import SQLExplain from '../index';

import { getSQLExplain } from '@/common/network/sql';
import SessionStore from '@/store/sessionManager/session';
import styles from './index.less';

interface IProps {
  session: SessionStore;
  visible: boolean;
  selectedSQL: string;
  onClose: () => void;
}

const ExecPlan: React.FC<IProps> = function (props) {
  const { visible, selectedSQL, session, onClose } = props;
  const [loadingExplain, setloadingExplain] = useState(false);
  const [sqlExplainToShow, setSqlExplainToShow] = useState(null);
  const fetchExecPlan = useCallback(
    async function () {
      if (!selectedSQL) {
        return;
      }
      setloadingExplain(true);
      setSqlExplainToShow(null);

      const explain = await getSQLExplain(
        selectedSQL,
        session?.sessionId,
        session?.database?.dbName,
      );
      setloadingExplain(false);

      if (explain) {
        setSqlExplainToShow(explain);
      }
    },
    [selectedSQL],
  );
  useEffect(() => {
    if (visible) {
      fetchExecPlan();
    }
  }, [selectedSQL, visible]);
  return (
    <Drawer
      title={formatMessage({
        id: 'workspace.window.sql.explain.tab.summary.title',
      })}
      placement="right"
      closable
      onClose={onClose}
      visible={visible}
      width={1200}
      className={styles.explainDrawer}
      bodyStyle={{
        paddingBottom: 50,
      }}
    >
      <Spin spinning={loadingExplain}>
        <SQLExplain session={session} sql={selectedSQL} explain={sqlExplainToShow} haveText />
      </Spin>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '100%',
          borderTop: '1px solid var(--divider-color)',
          padding: '10px 16px',
          background: 'var(--odc-antd-drawer-bg-color)',
          textAlign: 'right',
          zIndex: 1,
        }}
      >
        <Button onClick={onClose} type="primary">
          {
            formatMessage({
              id: 'odc.components.SQLPage.Closed',
            })
            /* 关闭 */
          }
        </Button>
      </div>
    </Drawer>
  );
};

export default ExecPlan;
