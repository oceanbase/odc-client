import { executeSQL } from '@/common/network/sql';
import { ConnectionMode, ISqlExecuteResultStatus } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import type { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import notification from '@/util/notification';
import { message, Modal } from 'antd';
import { inject, observer } from 'mobx-react';
import { useCallback, useEffect, useState } from 'react';
import CommonIDE from '../CommonIDE';

function SQLExecuteModal(props: {
  sqlStore?: SQLStore;
  isPL?: boolean;
  sql?: string;
  visible?: boolean;
  session: SessionStore;
  onClose: () => void;
  onSuccess: (innerSQL: string) => void;
}) {
  const { session, sql, visible, onClose, onSuccess } = props;
  const [innerSQL, setInnerSQL] = useState(sql);

  useEffect(() => {
    setInnerSQL(sql);
  }, [sql]);

  const doExecuteSQL = useCallback(async () => {
    try {
      const result = await executeSQL(innerSQL, session.sessionId, session.database?.dbName);
      if (result?.[0]?.status === ISqlExecuteResultStatus.SUCCESS) {
        onSuccess(innerSQL);
        message.success(
          formatMessage({
            id: 'odc.component.SQLExecuteModal.ExecutionSucceeded',
          }), // 执行成功
        );
      } else {
        notification.error(result?.[0]);
      }
    } catch (e) {
      //
    }
  }, [innerSQL, onSuccess]);

  return (
    <Modal
      title={formatMessage({
        id: 'odc.component.SQLExecuteModal.SqlConfirmation',
      })} /* SQL 确认 */
      width={600}
      bodyStyle={{
        height: 400,
      }}
      visible={visible}
      destroyOnClose
      okButtonProps={{
        disabled: !innerSQL,
      }}
      onCancel={onClose}
      onOk={doExecuteSQL}
    >
      <CommonIDE
        session={session}
        bordered={true}
        language={
          session?.connection.dialectType === ConnectionMode.OB_MYSQL ? 'obmysql' : 'oboracle'
        }
        initialSQL={sql}
        onSQLChange={(sql) => {
          setInnerSQL(sql);
        }}
      />
    </Modal>
  );
}
export default inject('sqlStore')(observer(SQLExecuteModal));
